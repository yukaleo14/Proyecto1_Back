import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Logger,
  ParseIntPipe,
  Put,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/gestion-usuario/auth/auth.guard';
import { Roles } from 'src/modules/gestion-usuario/auth/roles.decorator';
import { DomainExceptionFilter } from 'src/modules/common/filters/domain-exception.filter';
import { SuperLineaService } from '../services/super-linea.service';
import { CreateSuperLineaDto } from '../../dto/create-super-linea.dto';
import { UpdateSuperLineaDto } from '../../dto/update-super-linea.dto';
import { SuperLineaDto } from '../../dto/super-linea.dto';

@ApiTags('Gestion Productos')
@Controller('super-linea')
@UseGuards(AuthGuard)
@UseFilters(DomainExceptionFilter)
export class SuperLineaController {
  private readonly logger = new Logger(SuperLineaController.name);

  constructor(private readonly service: SuperLineaService) {}

  @Post()
  @Roles('Root', 'Administrador', 'Empleado')
  create(@Body() createDto: CreateSuperLineaDto) {
    this.logger.log('Creando una nueva SuperLínea...');
    return this.service.create(createDto);
  }

  @Get()
  @Roles('Root', 'Administrador', 'Empleado')
  @ApiOkResponse({ type: [SuperLineaDto] })
  findAll(): Promise<SuperLineaDto[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  @ApiOkResponse({ type: SuperLineaDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<SuperLineaDto> {
    return this.service.findDtoById(id);
  }

  @Put(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateSuperLineaDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('Root', 'Administrador', 'Empleado')
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.warn(`Solicitud para eliminar SuperLínea con ID: ${id}`);
    return this.service.remove(id);
  }
}
