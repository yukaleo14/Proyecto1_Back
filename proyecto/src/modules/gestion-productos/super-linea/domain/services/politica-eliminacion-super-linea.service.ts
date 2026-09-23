import { Inject, Injectable } from '@nestjs/common';
import { ILineaRepository } from '../../../linea/domain/interfaces/linea.repository.interface';
import { SuperLinea } from '../entities/super-linea.entity';

/**
 * Servicio de Dominio: Reglas de Integridad para la Eliminación de SuperLínea.
 *
 * Encapsula la regla que impide eliminar una SuperLinea si existen líneas vinculadas,
 * delegando la validación del invariante a la propia entidad raíz SuperLinea.
 */
@Injectable()
export class PoliticaEliminacionSuperLinea {
  constructor(
    @Inject('ILineaRepository')
    private readonly lineaRepository: ILineaRepository,
  ) {}

  /**
   * Verifica que la SuperLínea no tenga líneas vinculadas activas antes de eliminarla.
   *
   * @param superLinea Instancia de la SuperLínea que se intenta eliminar.
   * @throws SuperLineaConLineasAsociadasException si existen líneas asociadas activas.
   */
  async validarEliminacion(superLinea: SuperLinea): Promise<void> {
    const cantidadLineas = await this.lineaRepository.countBySuperLineaId(superLinea.id);
    superLinea.validarPuedeEliminarse(cantidadLineas);
  }

  /**
   * Retorna la cantidad de líneas activas asociadas a la SuperLínea.
   */
  async contarLineasActivas(superLineaId: number): Promise<number> {
    return this.lineaRepository.countBySuperLineaId(superLineaId);
  }
}
