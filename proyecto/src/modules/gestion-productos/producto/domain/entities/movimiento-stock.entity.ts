import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Producto } from './producto.entity';
import { TipoMovimientoStock } from '../enums/tipo-movimiento-stock.enum';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';
import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';

export interface MovimientoStockProps {
  id?: number;
  producto?: Producto;
  productoId?: number;
  tipoMovimiento: TipoMovimientoStock;
  cantidad: number;
  fecha?: Date;
  motivo?: string | null;
}

/**
 * Entidad MovimientoStock (4.2):
 * Representa cada cambio producido sobre el stock de un producto.
 * Aporta trazabilidad e historial: permite conocer por qué el stock llegó a determinado valor.
 *
 * Atributos:
 *  - id: Identificador único autoincremental.
 *  - productoId: ID del producto al que pertenece (relación N a 1).
 *  - tipoMovimiento: Compra, Venta, Devolución de cliente, Devolución a proveedor, Ajuste.
 *  - cantidad: Cantidad modificada (admite signo según tipo o delta para ajuste).
 *  - fecha: Timestamp del movimiento.
 *  - motivo: Motivo del movimiento (obligatorio si el tipo es Ajuste).
 */
@Entity('movimientos_stock')
export class MovimientoStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, (producto) => producto.movimientosStock, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Index()
  @Column({ name: 'producto_id', type: 'int' })
  productoId: number;

  @Column({
    name: 'tipo_movimiento',
    type: 'varchar',
    length: 50,
  })
  tipoMovimiento: TipoMovimientoStock;

  @CantidadColumn()
  cantidad: number;

  @Column({ type: 'text', nullable: true })
  motivo?: string | null;

  @CreateDateColumn({ name: 'fecha' })
  fecha: Date;

  constructor(props?: MovimientoStockProps) {
    if (!props) return;

    if (props.id !== undefined) this.id = props.id;
    if (props.producto) this.producto = props.producto;
    if (props.productoId) this.productoId = props.productoId;
    else if (props.producto?.id) this.productoId = props.producto.id;

    if (!props.tipoMovimiento) {
      throw new DatosProductoInvalidosException('El tipo de movimiento es obligatorio.');
    }
    this.tipoMovimiento = props.tipoMovimiento;

    if (props.cantidad === undefined || props.cantidad === null || isNaN(Number(props.cantidad))) {
      throw new DatosProductoInvalidosException('La cantidad debe ser un número válido.');
    }
    if (Number(props.cantidad) === 0) {
      throw new DatosProductoInvalidosException('La cantidad no puede ser cero.');
    }
    this.cantidad = Number(props.cantidad);

    // Si es un ajuste, el motivo es obligatorio
    if (props.tipoMovimiento === TipoMovimientoStock.AJUSTE) {
      if (!props.motivo || props.motivo.trim().length === 0) {
        throw new DatosProductoInvalidosException(
          'El motivo es obligatorio para registrar un ajuste de stock (ej: rotura, pérdida, error de carga, inventario físico).',
        );
      }
      this.motivo = props.motivo.trim();
    } else {
      this.motivo = props.motivo?.trim() ?? null;
    }

    this.fecha = props.fecha ?? new Date();
  }
}
