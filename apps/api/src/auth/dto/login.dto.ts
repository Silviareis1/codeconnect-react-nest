import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ana.silva@example.com', maxLength: 254 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'email deve ser um endereço válido.' })
  @MaxLength(254, { message: 'email deve ter no máximo 254 caracteres.' })
  email!: string;

  @ApiProperty({ example: 'Code@123' })
  @IsString({ message: 'senha deve ser um texto.' })
  @IsNotEmpty({ message: 'senha é obrigatória.' })
  senha!: string;
}
