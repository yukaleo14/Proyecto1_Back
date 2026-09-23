import { Transform } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSuperLineaDto {
  @ApiProperty({
    example: 'Bebidas',
    description: 'Nombre de la SuperLínea o categoría superior.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío.' })
  @MaxLength(255, { message: 'El nombre no puede superar los 255 caracteres.' })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Categoría que agrupa gaseosas, aguas y jugos.',
    description: 'Descripción detallada de la SuperLínea.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  descripcion?: string;
}
