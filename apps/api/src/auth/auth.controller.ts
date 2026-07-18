import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  LoginResponseDto,
  UserDataResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthenticatedRequest } from './interfaces/user.interface';

const badRequestExample = {
  statusCode: 400,
  message: ['email deve ser um endereço válido.'],
  error: 'Bad Request',
};

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Cadastrar usuário',
    description: 'Cria um usuário persistido no banco de dados.',
  })
  @ApiBody({
    type: RegisterDto,
    description: 'Dados necessários para cadastrar o usuário.',
    examples: {
      valid: {
        summary: 'Cadastro válido',
        value: {
          nome: 'Ana Silva',
          email: 'ana.silva@example.com',
          senha: 'Code@123',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Usuário cadastrado sem expor a senha.',
    type: UserDataResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de cadastro inválidos.',
    example: badRequestExample,
  })
  @ApiConflictResponse({
    description: 'E-mail já cadastrado.',
    example: {
      statusCode: 409,
      message: 'Já existe um usuário com este email.',
      error: 'Conflict',
    },
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autenticar usuário',
    description: 'Valida as credenciais e retorna um JWT e o usuário público.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais do usuário.',
    examples: {
      valid: {
        summary: 'Login válido',
        value: {
          email: 'ana.silva@example.com',
          senha: 'Code@123',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Login realizado com sucesso.',
    type: LoginResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Formato das credenciais inválido.',
    example: badRequestExample,
  })
  @ApiUnauthorizedResponse({
    description: 'E-mail ou senha inválidos.',
    example: {
      statusCode: 401,
      message: 'Email ou senha inválidos.',
      error: 'Unauthorized',
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Consultar usuário autenticado',
    description:
      'Endpoint protegido. Envie o token no formato Authorization: Bearer <token>.',
  })
  @ApiOkResponse({
    description: 'Dados públicos do usuário autenticado.',
    type: UserDataResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token ausente, inválido ou expirado.',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
    },
  })
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.getAuthenticatedUser(request.user);
  }
}
