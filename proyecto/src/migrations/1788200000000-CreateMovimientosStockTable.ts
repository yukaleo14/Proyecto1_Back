import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Creación de la tabla movimientos_stock para auditoría, trazabilidad e historial de stock.
 *
 * Estructura:
 *  - id:              PK autoincremental.
 *  - producto_id:     FK a producto (ON DELETE CASCADE — si se elimina el producto, se borra su historial).
 *  - tipo_movimiento: VARCHAR(50) NOT NULL (Compra, Venta, Devolución de cliente, Devolución a proveedor, Ajuste).
 *  - cantidad:        DECIMAL(12,3) NOT NULL — admite fracciones para cantidades continuas y delta con signo.
 *  - motivo:          TEXT nullable — descripción o razón (obligatorio para ajustes manuales).
 *  - fecha:           DATETIME(6) — timestamp automático de la operación.
 */
export class CreateMovimientosStockTable1788200000000 implements MigrationInterface {
  name = 'CreateMovimientosStockTable1788200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`movimientos_stock\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`producto_id\` int NOT NULL,
        \`tipo_movimiento\` varchar(50) NOT NULL COMMENT 'Compra, Venta, Devolución de cliente, Devolución a proveedor, Ajuste',
        \`cantidad\` decimal(12,3) NOT NULL COMMENT 'Cantidad de cambio sobre el stock',
        \`motivo\` text NULL COMMENT 'Razón del movimiento (obligatorio en ajustes)',
        \`fecha\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_movimientos_stock_producto_id\` (\`producto_id\`),
        INDEX \`IDX_movimientos_stock_fecha\` (\`fecha\`),
        CONSTRAINT \`FK_movimientos_stock_producto\`
          FOREIGN KEY (\`producto_id\`) REFERENCES \`producto\`(\`id\`)
          ON DELETE CASCADE
      ) ENGINE=InnoDB COMMENT='Registro de auditoría y trazabilidad de todos los movimientos de stock de productos'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`movimientos_stock\``);
  }
}
