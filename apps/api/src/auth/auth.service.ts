import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { promisify } from 'node:util';
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  LoginResponseDto,
  UserDataResponseDto,
} from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { PublicUser } from './interfaces/user.interface';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: RegisterDto): Promise<UserDataResponseDto> {
    const emailAlreadyRegistered = await this.usersService.findByEmail(
      dto.email,
    );

    if (emailAlreadyRegistered) {
      throw new ConflictException('Já existe um usuário com este email.');
    }

    const user = await this.usersService.create({
      id: randomUUID(),
      nome: dto.nome,
      email: dto.email,
      passwordHash: await this.hashPassword(dto.senha),
    });

    return {
      message: 'Usuário cadastrado com sucesso.',
      data: this.toPublicUser(user),
    };
  }

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);

    if (!user || !(await this.verifyPassword(dto.senha, user.passwordHash))) {
      throw new UnauthorizedException('Email ou senha inválidos.');
    }

    const payload: JwtPayload = { sub: user.id, email: user.email };

    return {
      message: 'Login realizado com sucesso.',
      data: {
        accessToken: await this.jwtService.signAsync(payload),
        user: this.toPublicUser(user),
      },
    };
  }

  getAuthenticatedUser(user: PublicUser): UserDataResponseDto {
    return {
      message: 'Usuário autenticado recuperado com sucesso.',
      data: user,
    };
  }

  async findPublicUserById(id: string): Promise<PublicUser | undefined> {
    const user = await this.usersService.findById(id);
    return user ? this.toPublicUser(user) : undefined;
  }

  private toPublicUser(
    user: Pick<User, 'id' | 'nome' | 'email'>,
  ): PublicUser {
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
    return `${salt}:${derivedKey.toString('hex')}`;
  }

  private async verifyPassword(
    password: string,
    storedHash: string,
  ): Promise<boolean> {
    const [salt, key] = storedHash.split(':');

    if (!salt || !key) {
      return false;
    }

    const storedKey = Buffer.from(key, 'hex');
    const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

    return (
      storedKey.length === derivedKey.length &&
      timingSafeEqual(storedKey, derivedKey)
    );
  }
}
