import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Ana Silva' })
  nome!: string;

  @ApiProperty({ example: 'ana.silva@example.com' })
  email!: string;
}

export class UserDataResponseDto {
  @ApiProperty({ example: 'Operação realizada com sucesso.' })
  message!: string;

  @ApiProperty({ type: UserResponseDto })
  data!: UserResponseDto;
}

export class LoginDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'Login realizado com sucesso.' })
  message!: string;

  @ApiProperty({ type: LoginDataDto })
  data!: LoginDataDto;
}
