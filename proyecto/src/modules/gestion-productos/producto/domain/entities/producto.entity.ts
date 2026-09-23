import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { Linea } from '../../../linea/domain/entities/linea.entity';
import { Marca } from '../../../marca/domain/entities/marca.entity';
import { AlicuotaIva } from 'src/modules/organizacion/enums/alicuota-iva.enum';
import { ApiProperty } from '@nestjs/swagger';
import { ProductoOperacion } from '../../../producto-operacion/entities/producto-operacion.entity';
import { Usuario } from 'src/modules/gestion-usuario/usuario/domain/entities/usuario.entity';
import { MonetarioColumn } from 'src/modules/common/decorators/monetario-column.decorator';
import { CantidadColumn } from 'src/modules/common/decorators/cantidad-column.decorator';
import { PorcentajeColumn } from 'src/modules/common/decorators/porcentaje-column.decorator';
import { Proveedor } from 'src/modules/organizacion/proveedor/domain/entities/proveedor.entity';
import { Costo, StockMinimo, Margen } from '../value-objects';
import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';

export interface ProductoProps {
  marca: Marca | number | string;
  linea: Linea | number | string;
  denominacion: string;
  costo: Costo | number;
  margen?: Margen | number;
  porcentaje?: Margen | number;
  stockMinimo: StockMinimo | number;
  stock?: number;
  codigoProveedor?: string | null;
  codigoBarra?: string | null;
  codigoReferencia?: string | null;
  observacion?: string;
  ubicacion?: string;
  alicuotaIva?: AlicuotaIva;
  utilizaStockMinimo?: boolean;
  costoEnDolar?: boolean;
  costoDolar?: number;
  cotizacionDolar?: number;
  precioDolar?: number;
  precio?: number;
  destacado?: boolean;
  envioGratis?: boolean;
  utilizaPack?: boolean;
  cantidadPorPack?: number | null;
  imagen?: string;
  sistema?: number;
  proveedor?: Proveedor;
  proveedorId?: number;
  usuarioCreated?: Usuario;
}

@Entity('producto')
export class Producto {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'text' })
  denominacion: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true })
  codigoProveedor?: string | null;

  @Column({ type: 'text', nullable: true })
  codigoBarra?: string | null;

  // ========== PROVEEDOR ==========
  @ManyToOne(() => Proveedor, (pro) => pro.proveedoresOperacion, {
    eager: true,
  })
  @JoinColumn({ name: 'proveedor_id' })
  @Index()
  proveedor: Proveedor;

  @Column({ type: 'int', nullable: true })
  proveedorId?: number;

  /*
  Nota: No usar el enum alicuota iva en @Column
        sino no anda el importar precios 
  */
  @PorcentajeColumn(21.0)
  alicuotaIva: AlicuotaIva;

  // Stock: cantidades reales, admite fracciones (1.5 kg, 0.25 lts)
  @CantidadColumn()
  stock: number;

  @Column('boolean', { default: false })
  utilizaStockMinimo: boolean;

  @Column('boolean', { default: false })
  utilizaStockMinimoPorEmpresa: boolean;

  @CantidadColumn()
  stockMinimo: number;

  @MonetarioColumn()
  costo?: number;

  @MonetarioColumn()
  costoDolar?: number;

  /*
  Ultima cotizacion dolar por el cambio de precio si producto posee costo dolar
  */
  @MonetarioColumn()
  cotizacionDolar?: number;

  @MonetarioColumn()
  precioDolar?: number;

  // Precio de venta
  @MonetarioColumn()
  precio?: number;

  @PorcentajeColumn()
  porcentaje?: number;

  @Column({ type: 'timestamp', nullable: true })
  fechaCosto?: Date;

  @Column('boolean', { default: false })
  costoEnDolar?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  fechaCostoDolar?: Date;

  @Column('boolean', { default: false })
  destacado?: boolean;

  @Column('boolean', { default: false })
  envioGratis?: boolean;

  @Column({ type: 'text', nullable: true })
  observacion?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  deletedAt?: Date;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_created_id' })
  usuarioCreated: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_updated_id' })
  usuarioUpdated: Usuario;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_deleted_id' })
  usuarioDeleted: Usuario;

  // ========== LINEA ==========
  @ManyToOne(() => Linea, (linea) => linea.productos)
  @JoinColumn({ name: 'linea_id' })
  linea: Linea;

  @Column({ type: 'int', nullable: true })
  lineaId?: number;

  // ==========  MARCA ==========
  @ManyToOne(() => Marca, (marca) => marca.productos)
  @JoinColumn({ name: 'marca_id' })
  marca: Marca;

  @Column({ type: 'int', nullable: true })
  marcaId?: number;

  @Column({ default: false })
  utilizaPack: boolean;

  @Column({ type: 'int', nullable: true })
  cantidadPorPack: number | null;

  @Column({ type: 'text', nullable: true })
  imagen?: string;

  @Column({ type: 'text', nullable: true })
  ubicacion?: string;

  @ManyToOne(() => Producto, (producto) => producto.productosOperacion)
  productosOperacion: ProductoOperacion;

  @Column({ type: 'int', default: 0 })
  sistema: number;

  @Column({ type: 'text', nullable: true })
  codigoReferencia?: string | null;

  // ========== CONSTRUCTORES & VALIDACIÓN DE INVARIANTES ==========
  constructor();
  constructor(props: ProductoProps);
  constructor(
    marca: Marca | number | string,
    linea: Linea | number | string,
    denominacion: string,
    costo: Costo | number,
    margen: Margen | number,
    stockMinimo: StockMinimo | number,
    stock?: number,
  );
  constructor(
    denominacion: string,
    marca: Marca | number | string,
    linea: Linea | number | string,
    costo: Costo | number,
    margen: Margen | number,
    stockMinimo: StockMinimo | number,
    stock?: number,
  );
  constructor(...args: any[]) {
    // Si se invoca sin argumentos (ej. TypeORM hidratando desde la base de datos), no aplicar validaciones
    if (args.length === 0) {
      return;
    }

    let marcaRaw: any;
    let lineaRaw: any;
    let denominacionRaw: any;
    let costoRaw: any;
    let margenRaw: any;
    let stockMinimoRaw: any;
    let stockRaw: any;
    let extraProps: any = {};

    if (
      args.length === 1 &&
      typeof args[0] === 'object' &&
      args[0] !== null &&
      !(args[0] instanceof Marca || args[0] instanceof Linea)
    ) {
      const props = args[0];
      marcaRaw = props.marca;
      lineaRaw = props.linea;
      denominacionRaw = props.denominacion;
      costoRaw = props.costo;
      margenRaw = props.margen !== undefined ? props.margen : props.porcentaje;
      stockMinimoRaw = props.stockMinimo;
      stockRaw = props.stock;
      extraProps = props;
    } else {
      // Argumentos posicionales
      if (
        typeof args[0] === 'string' &&
        (args[1] instanceof Marca ||
          (typeof args[1] === 'object' && args[1] !== null && 'id' in args[1]))
      ) {
        // Formato (denominacion, marca, linea, costo, margen, stockMinimo, stock?)
        denominacionRaw = args[0];
        marcaRaw = args[1];
        lineaRaw = args[2];
        costoRaw = args[3];
        margenRaw = args[4];
        stockMinimoRaw = args[5];
        stockRaw = args[6];
      } else {
        // Formato estándar solicitado: (marca, linea, denominacion, costo, margen, stockMinimo, stock?)
        marcaRaw = args[0];
        lineaRaw = args[1];
        denominacionRaw = args[2];
        costoRaw = args[3];
        margenRaw = args[4];
        stockMinimoRaw = args[5];
        stockRaw = args[6];
      }
    }

    // 1. Validar campos obligatorios y formato de strings
    this.validarCamposObligatorios(
      marcaRaw,
      lineaRaw,
      denominacionRaw,
      costoRaw,
      margenRaw,
      stockMinimoRaw,
    );

    // 2. Asignar Denominación
    this.denominacion = this.validarStringNoVacio(denominacionRaw, 'denominación');

    // 3. Asignar Marca
    if (typeof marcaRaw === 'string') {
      const marcaStr = this.validarStringNoVacio(marcaRaw, 'marca');
      const m = new Marca();
      m.denominacion = marcaStr;
      this.marca = m;
    } else if (typeof marcaRaw === 'number') {
      const m = new Marca();
      m.id = marcaRaw;
      this.marca = m;
      this.marcaId = marcaRaw;
    } else {
      this.marca = marcaRaw;
      if (marcaRaw?.id) this.marcaId = marcaRaw.id;
    }

    // 4. Asignar Línea
    if (typeof lineaRaw === 'string') {
      const lineaStr = this.validarStringNoVacio(lineaRaw, 'línea');
      const l = new Linea();
      l.denominacion = lineaStr;
      this.linea = l;
    } else if (typeof lineaRaw === 'number') {
      const l = new Linea();
      l.id = lineaRaw;
      this.linea = l;
      this.lineaId = lineaRaw;
    } else {
      this.linea = lineaRaw;
      if (lineaRaw?.id) this.lineaId = lineaRaw.id;
    }

    // 5. Validar y encapsular Value Objects
    const costoVo =
      costoRaw instanceof Costo ? costoRaw : new Costo(Number(costoRaw));
    this.costo = costoVo.getValue();

    const margenVo =
      margenRaw instanceof Margen ? margenRaw : new Margen(Number(margenRaw));
    this.porcentaje = margenVo.getValue();

    const stockMinimoVo =
      stockMinimoRaw instanceof StockMinimo
        ? stockMinimoRaw
        : new StockMinimo(Number(stockMinimoRaw));
    this.stockMinimo = stockMinimoVo.getValue();

    // 6. Validar Stock
    if (stockRaw !== undefined && stockRaw !== null) {
      if (typeof stockRaw === 'string' && (stockRaw as string).trim().length === 0) {
        throw new DatosProductoInvalidosException('El stock no puede estar vacío.');
      }
      const stockNum = Number(stockRaw);
      if (isNaN(stockNum) || stockNum < 0) {
        throw new DatosProductoInvalidosException('El stock no puede ser negativo.');
      }
      this.stock = stockNum;
    } else {
      this.stock = 0;
    }

    // 7. Validar strings opcionales si vienen en extraProps
    this.asignarYValidarPropiedadesOpcionales(extraProps);

    // 8. Calcular precio inicial
    this.calcularPrecio();
  }

  // ========== GETTERS / SETTERS ==========
  get margen(): number | undefined {
    return this.porcentaje;
  }

  set margen(val: number | Margen | undefined) {
    if (val === undefined || val === null) {
      this.porcentaje = undefined;
      return;
    }
    const vo = val instanceof Margen ? val : new Margen(Number(val));
    this.porcentaje = vo.getValue();
    this.calcularPrecio();
  }

  getCostoVo(): Costo | undefined {
    return this.costo !== undefined ? new Costo(Number(this.costo)) : undefined;
  }

  getStockMinimoVo(): StockMinimo | undefined {
    return this.stockMinimo !== undefined
      ? new StockMinimo(Number(this.stockMinimo))
      : undefined;
  }

  getMargenVo(): Margen | undefined {
    return this.margen !== undefined
      ? new Margen(Number(this.margen))
      : undefined;
  }

  // ========== MÉTODOS DE DOMINIO ==========
  /**
   * Calcula el precio de venta basado en Costo y Margen.
   * Regla de negocio: Precio = Costo * (1 + Margen / 100)
   */
  calcularPrecio(): number {
    const costo = this.costo ?? 0;
    const margen = this.margen ?? this.porcentaje ?? 0;
    const precioCalculado = +(costo * (1 + margen / 100)).toFixed(2);
    this.precio = precioCalculado;
    return precioCalculado;
  }

  /**
   * Evalúa si el producto se encuentra en alerta de stock bajo.
   * Regla de negocio: stockActual <= stockMinimo
   */
  estaBajoMinimo(): boolean {
    return (this.stock ?? 0) <= (this.stockMinimo ?? 0);
  }

  /**
   * Actualiza el costo garantizando la invariante de negocio (Costo > 0)
   */
  actualizarCosto(nuevoCosto: Costo | number): void {
    if (nuevoCosto === undefined || nuevoCosto === null) {
      throw new DatosProductoInvalidosException('El costo es obligatorio.');
    }
    const vo =
      nuevoCosto instanceof Costo ? nuevoCosto : new Costo(Number(nuevoCosto));
    this.costo = vo.getValue();
    this.fechaCosto = new Date();
    this.calcularPrecio();
  }

  /**
   * Actualiza el margen garantizando la invariante de negocio (Margen >= 0)
   */
  actualizarMargen(nuevoMargen: Margen | number): void {
    if (nuevoMargen === undefined || nuevoMargen === null) {
      throw new DatosProductoInvalidosException('El margen es obligatorio.');
    }
    const vo =
      nuevoMargen instanceof Margen
        ? nuevoMargen
        : new Margen(Number(nuevoMargen));
    this.porcentaje = vo.getValue();
    this.calcularPrecio();
  }

  /**
   * Actualiza el stock mínimo garantizando la invariante (entero >= 0)
   */
  actualizarStockMinimo(nuevoStockMinimo: StockMinimo | number): void {
    if (nuevoStockMinimo === undefined || nuevoStockMinimo === null) {
      throw new DatosProductoInvalidosException('El stock mínimo es obligatorio.');
    }
    const vo =
      nuevoStockMinimo instanceof StockMinimo
        ? nuevoStockMinimo
        : new StockMinimo(Number(nuevoStockMinimo));
    this.stockMinimo = vo.getValue();
  }

  /**
   * Actualiza la denominación garantizando que no esté vacía ni en blanco
   */
  actualizarDenominacion(nuevaDenominacion: string): void {
    this.denominacion = this.validarStringNoVacio(
      nuevaDenominacion,
      'denominación',
    );
  }

  /**
   * Ajusta el stock asegurando motivo obligatorio y stock final no negativo
   */
  ajustarStock(cantidad: number, motivo: string): void {
    this.validarStringNoVacio(motivo, 'motivo de ajuste');
    if (typeof cantidad !== 'number' || isNaN(cantidad)) {
      throw new DatosProductoInvalidosException(
        'La cantidad de ajuste debe ser un número válido.',
      );
    }
    const nuevoStock = (this.stock ?? 0) + cantidad;
    if (nuevoStock < 0) {
      throw new DatosProductoInvalidosException(
        `El stock resultante (${nuevoStock}) no puede ser negativo.`,
      );
    }
    this.stock = nuevoStock;
  }

  // ========== MÉTODOS PRIVADOS DE VALIDACIÓN ==========
  private validarCamposObligatorios(
    marca: any,
    linea: any,
    denominacion: any,
    costo: any,
    margen: any,
    stockMinimo: any,
  ): void {
    if (marca === undefined || marca === null) {
      throw new DatosProductoInvalidosException('El campo marca es obligatorio.');
    }
    if (linea === undefined || linea === null) {
      throw new DatosProductoInvalidosException('El campo linea es obligatorio.');
    }
    if (denominacion === undefined || denominacion === null) {
      throw new DatosProductoInvalidosException(
        'El campo denominacion es obligatorio.',
      );
    }
    if (costo === undefined || costo === null) {
      throw new DatosProductoInvalidosException('El campo costo es obligatorio.');
    }
    if (margen === undefined || margen === null) {
      throw new DatosProductoInvalidosException('El campo margen es obligatorio.');
    }
    if (stockMinimo === undefined || stockMinimo === null) {
      throw new DatosProductoInvalidosException(
        'El campo stockMinimo es obligatorio.',
      );
    }
  }

  private validarStringNoVacio(valor: any, nombreCampo: string): string {
    if (valor === undefined || valor === null) {
      throw new DatosProductoInvalidosException(
        `El campo ${nombreCampo} es obligatorio.`,
      );
    }
    if (typeof valor !== 'string') {
      throw new DatosProductoInvalidosException(
        `El campo ${nombreCampo} debe ser una cadena de texto.`,
      );
    }
    if (valor.trim().length === 0) {
      throw new DatosProductoInvalidosException(
        `El campo ${nombreCampo} no puede estar vacío o contener solo espacios en blanco.`,
      );
    }
    return valor.trim();
  }

  private asignarYValidarPropiedadesOpcionales(props: any): void {
    const stringCampos: Array<{ key: string; label: string }> = [
      { key: 'codigoProveedor', label: 'código de proveedor' },
      { key: 'codigoBarra', label: 'código de barra' },
      { key: 'codigoReferencia', label: 'código de referencia' },
      { key: 'observacion', label: 'observación' },
      { key: 'ubicacion', label: 'ubicación' },
    ];

    for (const { key, label } of stringCampos) {
      const val = props[key];
      if (val !== undefined && val !== null) {
        if (typeof val === 'string' && val.length > 0 && val.trim().length === 0) {
          throw new DatosProductoInvalidosException(
            `El campo ${label} no puede contener solo espacios en blanco.`,
          );
        }
        (this as any)[key] = val;
      }
    }

    if (props.alicuotaIva !== undefined) this.alicuotaIva = props.alicuotaIva;
    if (props.utilizaStockMinimo !== undefined)
      this.utilizaStockMinimo = props.utilizaStockMinimo;
    if (props.utilizaStockMinimoPorEmpresa !== undefined)
      this.utilizaStockMinimoPorEmpresa = props.utilizaStockMinimoPorEmpresa;
    if (props.costoEnDolar !== undefined) this.costoEnDolar = props.costoEnDolar;
    if (props.costoDolar !== undefined) this.costoDolar = props.costoDolar;
    if (props.cotizacionDolar !== undefined)
      this.cotizacionDolar = props.cotizacionDolar;
    if (props.precioDolar !== undefined) this.precioDolar = props.precioDolar;
    if (props.destacado !== undefined) this.destacado = props.destacado;
    if (props.envioGratis !== undefined) this.envioGratis = props.envioGratis;
    if (props.utilizaPack !== undefined) this.utilizaPack = props.utilizaPack;
    if (props.cantidadPorPack !== undefined)
      this.cantidadPorPack = props.cantidadPorPack;
    if (props.imagen !== undefined) this.imagen = props.imagen;
    if (props.sistema !== undefined) this.sistema = props.sistema;
    if (props.proveedor !== undefined) this.proveedor = props.proveedor;
    if (props.proveedorId !== undefined) this.proveedorId = props.proveedorId;
    if (props.usuarioCreated !== undefined)
      this.usuarioCreated = props.usuarioCreated;
  }
}
