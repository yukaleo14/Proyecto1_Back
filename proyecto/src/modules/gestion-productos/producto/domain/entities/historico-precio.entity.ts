import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Producto } from './producto.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';

@Entity('historico_precios')
export class HistoricoPrecio {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Producto, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'producto_id' })
  producto: Producto;

  @Column({ name: 'producto_id' })
  productoId: number;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'usuario_id', nullable: true })
  usuarioId: number;

  @Column('decimal', { precision: 12, scale: 2, name: 'precio_anterior', nullable: true })
  precioAnterior: number | null;

  @Column('decimal', { precision: 12, scale: 2, name: 'precio_nuevo' })
  precioNuevo: number;

  @Column({ type: 'varchar', length: 100, name: 'tipo_operacion' })
  tipoOperacion: string;

  @Column({ type: 'text', nullable: true })
  motivo: string;

  @CreateDateColumn({ name: 'fecha_hora' })
  fechaHora: Date;
}
