import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { SuperLineaConLineasAsociadasException } from '../exceptions/super-linea-con-lineas-asociadas.exception';
import { DatosSuperLineaInvalidosException } from '../exceptions/datos-super-linea-invalidos.exception';

export interface SuperLineaProps {
  nombre: string;
  descripcion?: string;
  sistema?: number;
}

@Entity('super_linea')
@Index(['nombre', 'deletedAt'], { unique: true })
export class SuperLinea {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;

  @OneToMany(() => Linea, (linea) => linea.superLinea)
  lineas: Linea[];

  @Column({ type: 'int', default: 0 })
  sistema: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  // ========== CONSTRUCTORES & VALIDACIÓN DE INVARIANTES ==========
  constructor();
  constructor(props: SuperLineaProps);
  constructor(nombre: string, descripcion?: string);
  constructor(...args: any[]) {
    // Si se invoca sin argumentos (hidratación de TypeORM), no aplicar validaciones
    if (args.length === 0) {
      return;
    }

    if (typeof args[0] === 'object' && args[0] !== null) {
      const props = args[0] as SuperLineaProps;
      this.actualizarNombre(props.nombre);
      this.descripcion = props.descripcion?.trim() || undefined;
      this.sistema = props.sistema ?? 0;
    } else {
      const [nombre, descripcion] = args;
      this.actualizarNombre(nombre);
      this.descripcion = descripcion ? String(descripcion).trim() : undefined;
      this.sistema = 0;
    }
  }

  // ========== MÉTODOS DE NEGOCIO / INVARIANTES ==========

  /**
   * Actualiza el nombre asegurando que no esté vacío ni contenga solo espacios en blanco.
   */
  actualizarNombre(nuevoNombre: string): void {
    if (
      nuevoNombre === undefined ||
      nuevoNombre === null ||
      typeof nuevoNombre !== 'string' ||
      nuevoNombre.trim().length === 0
    ) {
      throw new DatosSuperLineaInvalidosException(
        'El nombre de la SuperLínea es obligatorio y no puede estar vacío.',
      );
    }
    this.nombre = nuevoNombre.trim();
  }

  /**
   * Actualiza la descripción opcional de la SuperLínea.
   */
  actualizarDescripcion(nuevaDescripcion?: string): void {
    this.descripcion = nuevaDescripcion?.trim() || undefined;
  }

  /**
   * Regla de dominio: Impide la eliminación de la SuperLínea si existen líneas asociadas.
   *
   * @param cantidadLineas Cantidad de líneas vinculadas activas.
   * @throws SuperLineaConLineasAsociadasException si cantidadLineas > 0.
   */
  validarPuedeEliminarse(cantidadLineas: number): void {
    if (cantidadLineas > 0) {
      throw new SuperLineaConLineasAsociadasException(cantidadLineas);
    }
  }
}
