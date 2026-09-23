import { PartialType } from '@nestjs/swagger';
import { CreateSuperLineaDto } from './create-super-linea.dto';

export class UpdateSuperLineaDto extends PartialType(CreateSuperLineaDto) {}
