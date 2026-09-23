import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { Producto } from '../../../producto/domain/entities/producto.entity';
import { SuperLinea } from '../../../super-linea/domain/entities/super-linea.entity';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';
import { LineaSinSuperLineaException } from '../exceptions/linea-sin-super-linea.exception';

export interface LineaProps {
  denominacion: string;
  superLineaId: number;
  superLinea?: SuperLinea;
  observacion?: string;
  utilizaStockMinimo?: boolean;
  stockMinimo?: number;
  usuarioCreatedId?: number;
  sistema?: number;
}

@Entity('linea')
@Index(['denominacion', 'deletedAt'], { unique: true })
export class Linea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  denominacion: string;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  // ========== SUPER LINEA (Categoría Superior Obligatoria - Invariante de Existencia) ==========
  @ManyToOne(() => SuperLinea, (superLinea) => superLinea.lineas, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'super_linea_id' })
  superLinea: SuperLinea;

  @Column({ name: 'super_linea_id', type: 'int', nullable: false })
  superLineaId: number;

  @OneToMany(() => Producto, (producto) => producto.linea)
  productos: Producto[];

  @Column('boolean', { default: false })
  utilizaStockMinimo: boolean;

  @CantidadColumn()
  stockMinimo: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'int', nullable: true })
  usuarioCreatedId?: number;

  @Column({ type: 'int', nullable: true })
  usuarioDeletedId?: number;

  @Column({ type: 'int', nullable: true })
  usuarioUpdatedId?: number;

  @Column({ type: 'int', default: 0 })
  sistema: number;

  // ========== CONSTRUCTORES & VALIDACIÓN DE INVARIANTES ==========
  constructor();
  constructor(props: LineaProps);
  constructor(denominacion: string, superLineaId: number, observacion?: string);
  constructor(...args: any[]) {
    // Si se invoca sin argumentos (hidratación de TypeORM), no aplicar validaciones
    if (args.length === 0) {
      return;
    }

    if (typeof args[0] === 'object' && args[0] !== null) {
      const props = args[0] as LineaProps;
      this.validarInvariantes(props.denominacion, props.superLineaId ?? props.superLinea?.id);
      this.denominacion = props.denominacion.trim();
      this.superLineaId = props.superLineaId ?? props.superLinea!.id;
      if (props.superLinea) this.superLinea = props.superLinea;
      this.observacion = props.observacion?.trim();
      this.utilizaStockMinimo = props.utilizaStockMinimo ?? false;
      this.stockMinimo = props.stockMinimo ?? 0;
      this.usuarioCreatedId = props.usuarioCreatedId;
      this.sistema = props.sistema ?? 0;
    } else {
      const [denominacion, superLineaId, observacion] = args;
      this.validarInvariantes(denominacion, superLineaId);
      this.denominacion = String(denominacion).trim();
      this.superLineaId = Number(superLineaId);
      this.observacion = observacion ? String(observacion).trim() : undefined;
      this.utilizaStockMinimo = false;
      this.stockMinimo = 0;
      this.sistema = 0;
    }
  }

  // ========== MÉTODOS DE NEGOCIO ==========

  /**
   * Cambia la SuperLínea asociada garantizando la invariante de existencia.
   */
  cambiarSuperLinea(nuevaSuperLineaId: number): void {
    if (
      nuevaSuperLineaId === undefined ||
      nuevaSuperLineaId === null ||
      typeof nuevaSuperLineaId !== 'number' ||
      isNaN(nuevaSuperLineaId) ||
      nuevaSuperLineaId <= 0
    ) {
      throw new LineaSinSuperLineaException(
        'El superLineaId debe ser un identificador válido mayor a 0.',
      );
    }
    this.superLineaId = nuevaSuperLineaId;
  }

  // ========== VALIDACIÓN PRIVADA DE INVARIANTES ==========
  private validarInvariantes(denominacion: any, superLineaId: any): void {
    if (
      denominacion === undefined ||
      denominacion === null ||
      typeof denominacion !== 'string' ||
      denominacion.trim().length === 0
    ) {
      throw new Error('La denominación de la línea es obligatoria y no puede estar vacía.');
    }

    if (
      superLineaId === undefined ||
      superLineaId === null ||
      typeof superLineaId !== 'number' ||
      isNaN(superLineaId) ||
      superLineaId <= 0
    ) {
      throw new LineaSinSuperLineaException(
        'La SuperLínea es obligatoria para toda Línea (superLineaId inválido o ausente).',
      );
    }
  }
}
