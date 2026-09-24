import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
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
import { Costo, StockMinimo, Margen, Presentacion } from '../value-objects';
import { DatosProductoInvalidosException } from '../exceptions/datos-producto-invalidos.exception';
import { UnidadPresentacion } from '../enums/unidad-presentacion.enum';
import { MovimientoStock } from './movimiento-stock.entity';
import { TipoMovimientoStock } from '../enums/tipo-movimiento-stock.enum';

export interface ProductoProps {
  marca: Marca | number | string;
  linea: Linea | number | string;
  denominacion?: string;
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
  /** Valor numérico de la presentación (ej. 1.5 para 1.5 L). Debe ser > 0. */
  presentacionValor?: number;
  /** Unidad de la presentación (ej. 'L', 'ml', 'kg', 'pack'). */
  presentacionUnidad?: string;
  /** Instancia de Presentacion o texto (ej. "2L", "500ml"). */
  presentacion?: Presentacion | string;
  /** Indica si la denominación fue personalizada manualmente. Default: false. */
  esDenominacionManual?: boolean;
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

  // ========== PRESENTACION (Value Object compuesto en dos columnas) ==========
  /**
   * Columna que almacena el valor numérico del VO Presentacion.
   * Ej: 1.5 para "1.5 L", 354 para "354 ml", 6 para "6 pack".
   */
  @Column({ name: 'presentacion_valor', type: 'decimal', precision: 12, scale: 3, nullable: true })
  presentacionValor?: number;

  /**
   * Columna que almacena la unidad del VO Presentacion.
   * Acepta los valores del enum UnidadPresentacion o cualquier string corto.
   * Ej: 'L', 'ml', 'kg', 'pack'.
   */
  @Column({ name: 'presentacion_unidad', type: 'varchar', length: 30, nullable: true })
  presentacionUnidad?: string;

  /** Texto original de presentación si se especificó como string (ej. "2L") */
  private presentacionTexto?: string;

  // ========== DENOMINACIÓN MANUAL / AUTOMÁTICA ==========
  /**
   * Flag que indica si la denominación fue editada manualmente por el usuario.
   * Si es false, se recalcula automáticamente como Marca + " " + Linea + " " + Presentacion.
   */
  @Column('boolean', { default: false, name: 'es_denominacion_manual' })
  esDenominacionManual: boolean = false;

  // ========== MOVIMIENTOS DE STOCK (4.2 Trazabilidad e Historial) ==========
  @OneToMany(() => MovimientoStock, (mov) => mov.producto, { cascade: true })
  movimientosStock: MovimientoStock[];

  // ========== CONSTRUCTORES & VALIDACIÓN DE INVARIANTES ==========
  constructor();
  constructor(props: ProductoProps);
  constructor(
    marca: Marca | number | string,
    linea: Linea | number | string,
    presentacionODenominacion: Presentacion | string,
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
      const props = args[0] as ProductoProps;
      marcaRaw = props.marca;
      lineaRaw = props.linea;
      denominacionRaw = props.denominacion;
      costoRaw = props.costo;
      margenRaw = props.margen !== undefined ? props.margen : props.porcentaje;
      stockMinimoRaw = props.stockMinimo;
      stockRaw = props.stock;
      this.esDenominacionManual = props.esDenominacionManual ?? false;
      if (props.presentacion !== undefined) {
        this.asignarPresentacionInterna(props.presentacion);
      } else if (props.presentacionValor !== undefined && props.presentacionUnidad !== undefined) {
        this.presentacionValor = props.presentacionValor;
        this.presentacionUnidad = props.presentacionUnidad;
      }
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
        // Formato estándar: (marca, linea, denominacionOPresentacion, costo, margen, stockMinimo, stock?)
        marcaRaw = args[0];
        lineaRaw = args[1];
        const arg2 = args[2];
        // Si el tercer argumento es una Presentacion o texto tipo "2L"
        if (
          arg2 instanceof Presentacion ||
          (typeof arg2 === 'string' && /^\d+(?:\.\d+)?\s*[a-zA-ZñÑ]+$/.test(arg2.trim()))
        ) {
          this.asignarPresentacionInterna(arg2);
          denominacionRaw = undefined; // Se autogenerará
        } else {
          denominacionRaw = arg2;
        }
        costoRaw = args[3];
        margenRaw = args[4];
        stockMinimoRaw = args[5];
        stockRaw = args[6];
      }
    }

    // 1. Validar campos obligatorios numéricos y de relación
    if (marcaRaw === undefined || marcaRaw === null) {
      throw new DatosProductoInvalidosException('El campo marca es obligatorio.');
    }
    if (lineaRaw === undefined || lineaRaw === null) {
      throw new DatosProductoInvalidosException('El campo linea es obligatorio.');
    }
    if (costoRaw === undefined || costoRaw === null) {
      throw new DatosProductoInvalidosException('El campo costo es obligatorio.');
    }
    if (margenRaw === undefined || margenRaw === null) {
      throw new DatosProductoInvalidosException('El campo margen es obligatorio.');
    }
    if (stockMinimoRaw === undefined || stockMinimoRaw === null) {
      throw new DatosProductoInvalidosException('El campo stockMinimo es obligatorio.');
    }

    // 2. Asignar Marca
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

    // 9. Asignar o Autogenerar Denominación
    if (denominacionRaw === null) {
      throw new DatosProductoInvalidosException('El campo denominacion es obligatorio.');
    }
    if (denominacionRaw !== undefined) {
      this.denominacion = this.validarStringNoVacio(denominacionRaw, 'denominación');
    } else {
      const tienePresentacion =
        this.presentacionTexto !== undefined || this.presentacionValor !== undefined;
      if (!tienePresentacion) {
        throw new DatosProductoInvalidosException('El campo denominacion es obligatorio.');
      }
      this.denominacion = this.generarDenominacionAutomatica();
      if (!this.denominacion) {
        throw new DatosProductoInvalidosException('El campo denominacion es obligatorio.');
      }
    }
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
   * Actualiza el precio directamente y recalibra el margen para mantener la invariante
   * Precio = Costo * (1 + Margen / 100).
   */
  actualizarPrecio(nuevoPrecio: number): void {
    if (nuevoPrecio <= 0) {
      throw new DatosProductoInvalidosException('El precio resultante debe ser mayor a 0.');
    }
    this.precio = +nuevoPrecio.toFixed(2);
    
    if (this.costo && this.costo > 0) {
      this.porcentaje = +(((this.precio / this.costo) - 1) * 100).toFixed(2);
    }
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
   * Actualiza la denominación garantizando que no esté vacía ni en blanco.
   * Si se edita directamente, se marca como personalizada manualmente.
   */
  actualizarDenominacion(nuevaDenominacion: string): void {
    this.personalizarDenominacion(nuevaDenominacion);
  }

  // ========== DENOMINACIÓN AUTOMÁTICA & PERSONALIZADA ==========

  /**
   * Método de dominio: Genera la denominación automática concatenando Marca + " " + Linea + " " + Presentacion.
   * Omite componentes vacíos y recorta espacios redundantes.
   */
  generarDenominacionAutomatica(): string {
    const partes: string[] = [];
    const marcaNombre = this.obtenerNombreMarca();
    if (marcaNombre) partes.push(marcaNombre);

    const lineaNombre = this.obtenerNombreLinea();
    if (lineaNombre) partes.push(lineaNombre);

    const presentacionTexto = this.obtenerTextoPresentacion();
    if (presentacionTexto) partes.push(presentacionTexto);

    return partes.join(' ').trim();
  }

  /**
   * Método de dominio: Personaliza manualmente la denominación del producto.
   * Establece esDenominacionManual = true para proteger el texto ante futuros cambios
   * de marca, línea o presentación.
   *
   * @param nuevaDenominacion Texto personalizado no vacío.
   */
  personalizarDenominacion(nuevaDenominacion: string): void {
    this.denominacion = this.validarStringNoVacio(nuevaDenominacion, 'denominación');
    this.esDenominacionManual = true;
  }

  /**
   * Restablece la denominación a modo automático (esDenominacionManual = false)
   * y recalcula el nombre concatenando Marca + Línea + Presentación.
   */
  restablecerDenominacionAutomatica(): void {
    this.esDenominacionManual = false;
    this.denominacion = this.generarDenominacionAutomatica();
  }

  /**
   * Método de negocio: Cambia la marca del producto.
   * Si esDenominacionManual == false, regenera automáticamente la denominación.
   */
  cambiarMarca(nuevaMarca: Marca | string | number): void {
    if (nuevaMarca === undefined || nuevaMarca === null) {
      throw new DatosProductoInvalidosException('La marca es obligatoria.');
    }
    if (typeof nuevaMarca === 'string') {
      const denominacion = this.validarStringNoVacio(nuevaMarca, 'marca');
      const m = new Marca();
      m.denominacion = denominacion;
      this.marca = m;
    } else if (typeof nuevaMarca === 'number') {
      const m = new Marca();
      m.id = nuevaMarca;
      this.marca = m;
      this.marcaId = nuevaMarca;
    } else if (nuevaMarca instanceof Marca) {
      this.marca = nuevaMarca;
      this.marcaId = nuevaMarca.id;
    }

    if (!this.esDenominacionManual) {
      this.denominacion = this.generarDenominacionAutomatica();
    }
  }

  /**
   * Método de negocio: Cambia la línea del producto.
   * Si esDenominacionManual == false, regenera automáticamente la denominación.
   */
  cambiarLinea(nuevaLinea: Linea | string | number): void {
    if (nuevaLinea === undefined || nuevaLinea === null) {
      throw new DatosProductoInvalidosException('La línea es obligatoria.');
    }
    if (typeof nuevaLinea === 'string') {
      const denominacion = this.validarStringNoVacio(nuevaLinea, 'línea');
      const l = new Linea();
      l.denominacion = denominacion;
      this.linea = l;
    } else if (typeof nuevaLinea === 'number') {
      const l = new Linea();
      l.id = nuevaLinea;
      this.linea = l;
      this.lineaId = nuevaLinea;
    } else if (nuevaLinea instanceof Linea) {
      this.linea = nuevaLinea;
      this.lineaId = nuevaLinea.id;
    }

    if (!this.esDenominacionManual) {
      this.denominacion = this.generarDenominacionAutomatica();
    }
  }

  /**
   * 5.3 Regla de Ajuste de stock:
   * Permite modificar manualmente el stock de un producto, siempre indicando un motivo.
   * Motivos típicos: error de carga, rotura, pérdida, inventario físico.
   * Puede resultar en un aumento o una disminución de stock, y queda registrado como un MovimientoStock para mantener trazabilidad.
   * Ejemplo: stock actual = 10 -> ajuste = -2 (motivo: rotura) -> nuevo stock = 8.
   */
  ajustarStock(cantidad: number, motivo: string): MovimientoStock {
    this.validarStringNoVacio(motivo, 'motivo de ajuste');
    if (typeof cantidad !== 'number' || isNaN(cantidad)) {
      throw new DatosProductoInvalidosException(
        'La cantidad de ajuste debe ser un número válido.',
      );
    }
    const cantNum = Number(cantidad);
    if (cantNum === 0) {
      throw new DatosProductoInvalidosException('La cantidad de ajuste no puede ser cero.');
    }
    const nuevoStock = +(Number(this.stock ?? 0) + cantNum).toFixed(3);
    if (nuevoStock < 0) {
      throw new DatosProductoInvalidosException(
        `El stock resultante (${nuevoStock}) no puede ser negativo.`,
      );
    }
    this.stock = nuevoStock;

    const movimiento = new MovimientoStock({
      productoId: this.id,
      producto: this,
      tipoMovimiento: TipoMovimientoStock.AJUSTE,
      cantidad: cantNum,
      motivo: motivo.trim(),
      fecha: new Date(),
    });

    if (!this.movimientosStock) {
      this.movimientosStock = [];
    }
    this.movimientosStock.push(movimiento);

    return movimiento;
  }

  /**
   * Registra un movimiento de stock tipificado (Compra, Venta, Devoluciones, Ajuste)
   * garantizando la invariante de no negatividad del stock y la trazabilidad.
   */
  registrarMovimiento(
    tipoMovimiento: TipoMovimientoStock,
    cantidad: number,
    motivo?: string,
  ): MovimientoStock {
    if (!tipoMovimiento) {
      throw new DatosProductoInvalidosException('El tipo de movimiento es obligatorio.');
    }
    if (typeof cantidad !== 'number' || isNaN(cantidad) || cantidad === 0) {
      throw new DatosProductoInvalidosException(
        'La cantidad debe ser un número válido distinto de cero.',
      );
    }

    if (tipoMovimiento === TipoMovimientoStock.AJUSTE) {
      return this.ajustarStock(cantidad, motivo ?? '');
    }

    const cantAbs = Math.abs(cantidad);
    let delta = 0;

    switch (tipoMovimiento) {
      case TipoMovimientoStock.COMPRA:
      case TipoMovimientoStock.DEVOLUCION_CLIENTE:
        delta = cantAbs; // Aumenta stock
        break;
      case TipoMovimientoStock.VENTA:
      case TipoMovimientoStock.DEVOLUCION_PROVEEDOR:
        delta = -cantAbs; // Disminuye stock
        break;
    }

    const nuevoStock = +(Number(this.stock ?? 0) + delta).toFixed(3);
    if (nuevoStock < 0) {
      throw new DatosProductoInvalidosException(
        `El stock resultante (${nuevoStock}) no puede ser negativo tras el movimiento de ${tipoMovimiento}.`,
      );
    }
    this.stock = nuevoStock;

    const movimiento = new MovimientoStock({
      productoId: this.id,
      producto: this,
      tipoMovimiento,
      cantidad: delta,
      motivo: motivo?.trim() ?? null,
      fecha: new Date(),
    });

    if (!this.movimientosStock) {
      this.movimientosStock = [];
    }
    this.movimientosStock.push(movimiento);

    return movimiento;
  }

  /**
   * Método de negocio: Cambia la presentación del producto.
   * Acepta una instancia de Presentacion o un texto (ej. "2L", "500ml").
   * Si esDenominacionManual == false, regenera automáticamente la denominación.
   *
   * @param nuevaPresentacion Instancia válida de Presentacion o texto.
   * @throws DatosProductoInvalidosException si la presentación es inválida o vacía.
   */
  cambiarPresentacion(nuevaPresentacion: Presentacion | string): void {
    if (nuevaPresentacion === undefined || nuevaPresentacion === null) {
      throw new DatosProductoInvalidosException('La presentación es obligatoria.');
    }

    this.asignarPresentacionInterna(nuevaPresentacion);

    if (!this.esDenominacionManual) {
      this.denominacion = this.generarDenominacionAutomatica();
    }
  }

  /**
   * Devuelve el Value Object Presentacion reconstituido desde la persistencia.
   * Retorna null si el producto no tiene presentación asignada.
   */
  getPresentacion(): Presentacion | null {
    if (
      this.presentacionValor === undefined ||
      this.presentacionValor === null ||
      this.presentacionUnidad === undefined ||
      this.presentacionUnidad === null
    ) {
      return null;
    }
    return Presentacion.fromPersistence(this.presentacionValor, this.presentacionUnidad);
  }

  private asignarPresentacionInterna(pres: Presentacion | string): void {
    if (typeof pres === 'string') {
      const str = pres.trim();
      const match = str.match(/^(\d+(?:\.\d+)?)\s*([a-zA-ZñÑ]+)$/);
      if (!match) {
        throw new DatosProductoInvalidosException(
          'Formato de presentación inválido (ej. "2L", "500ml", "1.5L").',
        );
      }
      const valor = parseFloat(match[1]);
      const unidad = match[2];
      const vo = new Presentacion(valor, unidad);
      this.presentacionValor = vo.getValue();
      this.presentacionUnidad = vo.getUnidad();
      this.presentacionTexto = str;
    } else if (pres instanceof Presentacion) {
      this.presentacionValor = pres.getValue();
      this.presentacionUnidad = pres.getUnidad();
      this.presentacionTexto = undefined;
    } else {
      throw new DatosProductoInvalidosException(
        'El argumento debe ser una instancia válida de Presentacion o texto (ej. "2L").',
      );
    }
  }

  private obtenerNombreMarca(): string {
    if (!this.marca) return '';
    if (typeof this.marca === 'string') return this.marca;
    if (typeof this.marca === 'object' && 'denominacion' in this.marca) {
      return (this.marca.denominacion ?? '').trim();
    }
    return '';
  }

  private obtenerNombreLinea(): string {
    if (!this.linea) return '';
    if (typeof this.linea === 'string') return this.linea;
    if (typeof this.linea === 'object' && 'denominacion' in this.linea) {
      return (this.linea.denominacion ?? '').trim();
    }
    return '';
  }

  private obtenerTextoPresentacion(): string {
    if (this.presentacionTexto) {
      return this.presentacionTexto.trim();
    }
    if (this.presentacionValor != null && this.presentacionUnidad != null) {
      const unidad = this.presentacionUnidad.trim();
      if (/^[a-zA-Z]+$/.test(unidad) && unidad.length <= 4) {
        return `${this.presentacionValor}${unidad}`;
      }
      return `${this.presentacionValor} ${unidad}`;
    }
    return '';
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
