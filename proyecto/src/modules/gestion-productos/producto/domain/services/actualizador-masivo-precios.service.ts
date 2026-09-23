import { Inject, Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IProductoRepository } from '../interfaces/producto.repository-interface';
import { Producto } from '../entities/producto.entity';
import { ResultadoSimulacionDto } from '../../dto/resultado-simulacion.dto';
import { OperacionInvalidaException } from '../exceptions/operacion-invalida.exception';

/**
 * Servicio de dominio que orquesta la actualización en lote de precios.
 *
 * Responsabilidades:
 *  1. Obtener los productos candidatos según el alcance del ajuste.
 *  2. Calcular el precio proyectado para cada uno (sin tocar la DB).
 *  3. Validar la invariante de negocio: ningún precio resultante puede ser ≤ 0.
 *  4. Si la validación pasa, persistir todos los cambios en una transacción atómica.
 *
 * Si al menos un producto viola la invariante → OperacionInvalidaException y
 * la transacción completa es cancelada (rollback).
 */
@Injectable()
export class ActualizadorMasivoPreciosService {
  private readonly logger = new Logger(ActualizadorMasivoPreciosService.name);

  constructor(
    @Inject('IProductoRepository')
    private readonly productoRepository: IProductoRepository,
    private readonly dataSource: DataSource,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // PREVIEW / SIMULACIÓN  (solo lectura, sin persistencia)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Calcula el efecto de un ajuste porcentual sobre TODOS los productos activos.
   * No modifica la base de datos.
   *
   * @param porcentaje Porcentaje de ajuste (ej. 10 = +10%, -5 = -5%).
   */
  async simularAjustePorcentajeGlobal(
    porcentaje: number,
  ): Promise<ResultadoSimulacionDto[]> {
    const productos = await this.productoRepository.findTodosActivos();
    return this.calcularSimulacion(productos, 'porcentaje', porcentaje);
  }

  /**
   * Calcula el efecto de un ajuste por monto fijo sobre los productos de una Línea.
   * No modifica la base de datos.
   *
   * @param lineaId  ID de la Línea objetivo.
   * @param monto    Monto a sumar/restar (ej. 100 = +$100, -50 = -$50).
   */
  async simularAjusteMontoFijoPorLinea(
    lineaId: number,
    monto: number,
  ): Promise<ResultadoSimulacionDto[]> {
    const productos = await this.productoRepository.findActivosByLineaId(lineaId);
    return this.calcularSimulacion(productos, 'monto', monto);
  }

  /**
   * Calcula el efecto de un ajuste porcentual sobre todos los productos
   * cuya Línea pertenece a la SuperLínea indicada.
   * No modifica la base de datos.
   *
   * @param superLineaId ID de la SuperLínea objetivo.
   * @param porcentaje   Porcentaje de ajuste.
   */
  async simularAjustePorcentajePorSuperLinea(
    superLineaId: number,
    porcentaje: number,
  ): Promise<ResultadoSimulacionDto[]> {
    const productos = await this.productoRepository.findActivosBySuperLineaId(superLineaId);
    return this.calcularSimulacion(productos, 'porcentaje', porcentaje);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EJECUCIÓN  (transacción atómica con validación de invariante)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Aplica un ajuste porcentual sobre TODOS los productos activos.
   *
   * Invariante: ningún precio resultante puede ser ≤ 0.
   * Si la invariante se viola → OperacionInvalidaException (rollback completo).
   *
   * @param porcentaje  Porcentaje de ajuste.
   * @param _usuarioId  ID del usuario que ejecuta la operación (para auditoría futura).
   * @returns Resumen de los productos actualizados.
   */
  async ejecutarAjustePorcentajeGlobal(
    porcentaje: number,
    _usuarioId: number,
  ): Promise<ResultadoSimulacionDto[]> {
    this.logger.log(`[Masivo] Ajuste porcentual global: ${porcentaje}%`);
    const productos = await this.productoRepository.findTodosActivos();
    return this.ejecutarAjuste(productos, 'porcentaje', porcentaje);
  }

  /**
   * Aplica un ajuste por monto fijo a los productos de una Línea.
   *
   * @param lineaId     Línea objetivo.
   * @param monto       Monto fijo a sumar/restar.
   * @param _usuarioId  ID del usuario ejecutor.
   */
  async ejecutarAjusteMontoFijoPorLinea(
    lineaId: number,
    monto: number,
    _usuarioId: number,
  ): Promise<ResultadoSimulacionDto[]> {
    this.logger.log(`[Masivo] Ajuste monto fijo linea ${lineaId}: $${monto}`);
    const productos = await this.productoRepository.findActivosByLineaId(lineaId);
    return this.ejecutarAjuste(productos, 'monto', monto);
  }

  /**
   * Aplica un ajuste porcentual a todos los productos de una SuperLínea.
   *
   * @param superLineaId SuperLínea objetivo.
   * @param porcentaje   Porcentaje de ajuste.
   * @param _usuarioId   ID del usuario ejecutor.
   */
  async ejecutarAjustePorcentajePorSuperLinea(
    superLineaId: number,
    porcentaje: number,
    _usuarioId: number,
  ): Promise<ResultadoSimulacionDto[]> {
    this.logger.log(
      `[Masivo] Ajuste porcentual super-linea ${superLineaId}: ${porcentaje}%`,
    );
    const productos = await this.productoRepository.findActivosBySuperLineaId(superLineaId);
    return this.ejecutarAjuste(productos, 'porcentaje', porcentaje);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Orquesta la ejecución atómica: simula → valida → persiste.
   */
  private async ejecutarAjuste(
    productos: Producto[],
    modo: 'porcentaje' | 'monto',
    valor: number,
  ): Promise<ResultadoSimulacionDto[]> {
    const simulacion = this.calcularSimulacion(productos, modo, valor);

    // Validar invariante ANTES de abrir la transacción
    this.validarInvariante(simulacion);

    const actualizaciones = simulacion.map((s) => ({
      id: s.productoId,
      precio: s.precioProyectado,
    }));

    // Transacción atómica: si cualquier update falla → rollback automático
    await this.dataSource.transaction(async (manager) => {
      await this.productoRepository.actualizarPrecioMasivo(actualizaciones, manager);
    });

    this.logger.log(`[Masivo] ${actualizaciones.length} productos actualizados exitosamente.`);
    return simulacion;
  }

  /**
   * Genera el array de ResultadoSimulacionDto sin efectos secundarios.
   * Puramente funcional: no depende de DB, no modifica estado.
   *
   * @param productos  Lista de productos candidatos.
   * @param modo       'porcentaje' → precio * (1 + pct/100), 'monto' → precio + monto.
   * @param valor      Magnitud del ajuste.
   */
  private calcularSimulacion(
    productos: Producto[],
    modo: 'porcentaje' | 'monto',
    valor: number,
  ): ResultadoSimulacionDto[] {
    return productos.map((p) => {
      const precioActual = p.precio ?? 0;
      const precioProyectado = this.calcularNuevoPrecio(precioActual, modo, valor);

      return {
        productoId: p.id,
        denominacion: p.denominacion,
        lineaId: p.lineaId,
        superLineaId: (p.linea as any)?.superLineaId ?? undefined,
        precioActual,
        precioProyectado,
      } satisfies ResultadoSimulacionDto;
    });
  }

  /**
   * Calcula el nuevo precio aplicando la regla de negocio correspondiente.
   * Redondea a 2 decimales para evitar flotantes espurios.
   *
   * @param precioActual   Precio de venta vigente.
   * @param modo           Tipo de ajuste.
   * @param valor          Magnitud (porcentaje o monto).
   */
  private calcularNuevoPrecio(
    precioActual: number,
    modo: 'porcentaje' | 'monto',
    valor: number,
  ): number {
    if (modo === 'porcentaje') {
      return +(precioActual * (1 + valor / 100)).toFixed(2);
    }
    // modo === 'monto'
    return +(precioActual + valor).toFixed(2);
  }

  /**
   * Verifica la invariante de negocio: ningún precio proyectado puede ser ≤ 0.
   *
   * @throws OperacionInvalidaException con el listado de productos inválidos.
   */
  private validarInvariante(simulacion: ResultadoSimulacionDto[]): void {
    const invalidos = simulacion.filter((s) => s.precioProyectado <= 0);

    if (invalidos.length > 0) {
      const detalles = invalidos.map((s) => ({
        id: s.productoId,
        denominacion: s.denominacion,
        precioProyectado: s.precioProyectado,
      }));

      const mensajes = detalles
        .map(
          (d) =>
            `"${d.denominacion}" (ID: ${d.id}) resultaría con precio inválido ($${d.precioProyectado.toFixed(2)})`,
        )
        .join('; ');

      throw new OperacionInvalidaException(
        `La operación fue cancelada. Los siguientes productos resultarían con precio ≤ 0: ${mensajes}.`,
        detalles,
      );
    }
  }
}
