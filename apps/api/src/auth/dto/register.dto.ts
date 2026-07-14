import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Ana Silva', minLength: 2, maxLength: 100 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'nome deve ser um texto.' })
  @IsNotEmpty({ message: 'nome é obrigatório.' })
  @Length(2, 100, { message: 'nome deve ter entre 2 e 100 caracteres.' })
  nome!: string;

  @ApiProperty({ example: 'ana.silva@example.com', maxLength: 254 })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'email deve ser um endereço válido.' })
  @MaxLength(254, { message: 'email deve ter no máximo 254 caracteres.' })
  email!: string;

  @ApiProperty({ example: 'Code@123', minLength: 8, maxLength: 128 })
  @IsString({ message: 'senha deve ser um texto.' })
  @MinLength(8, { message: 'senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(128, { message: 'senha deve ter no máximo 128 caracteres.' })
  @Matches(/[A-Z]/, { message: 'senha deve conter uma letra maiúscula.' })
  @Matches(/[a-z]/, { message: 'senha deve conter uma letra minúscula.' })
  @Matches(/\d/, { message: 'senha deve conter um número.' })
  @Matches(/[^A-Za-z0-9]/, {
    message: 'senha deve conter um caractere especial.',
  })
  senha!: string;
}
