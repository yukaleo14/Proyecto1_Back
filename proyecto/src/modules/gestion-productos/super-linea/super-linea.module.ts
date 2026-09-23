import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperLinea } from './domain/entities/super-linea.entity';
import { SuperLineaController } from './application/controllers/super-linea.controller';
import { SuperLineaService } from './application/services/super-linea.service';
import { SuperLineaPersistenceAdapter } from './infraestructure/repositories/super-linea.persistence-adapter';
import { SuperLineaRepository } from './infraestructure/repositories/super-linea.repository';
import { PoliticaEliminacionSuperLinea } from './domain/services/politica-eliminacion-super-linea.service';
import { LineaModule } from '../linea/linea.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuperLinea]),
    forwardRef(() => LineaModule),
  ],
  controllers: [SuperLineaController],
  providers: [
    SuperLineaService,
    PoliticaEliminacionSuperLinea,
    SuperLineaPersistenceAdapter,
    {
      provide: 'ISuperLineaRepository',
      useClass: SuperLineaRepository,
    },
  ],
  exports: [
    TypeOrmModule,
    SuperLineaService,
    PoliticaEliminacionSuperLinea,
    'ISuperLineaRepository',
  ],
})
export class SuperLineaModule {}
