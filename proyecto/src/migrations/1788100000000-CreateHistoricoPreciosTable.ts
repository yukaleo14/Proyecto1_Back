import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Creación de la tabla historico_precios para auditoría de cambios de precio.
 *
 * Justificación:
 *  La entidad HistoricoPrecio es un nuevo requerimiento de trazabilidad del negocio
 *  (análogo a MovimientoStock). Sin este script, el despliegue en producción fallará
 *  al intentar insertar el primer registro de historial, ya que la tabla no existe.
 *
 * Estructura:
 *  - id:              PK autoincremental.
 *  - producto_id:     FK a producto (ON DELETE CASCADE — si se elimina el producto, se borra su historial).
 *  - usuario_id:      FK nullable a usuario (ON DELETE SET NULL — preserva historial si el usuario es eliminado).
 *  - precio_anterior: DECIMAL(12,2) nullable — NULL en la creación inicial del producto.
 *  - precio_nuevo:    DECIMAL(12,2) NOT NULL — precio resultante después del cambio.
 *  - tipo_operacion:  VARCHAR(100) NOT NULL — identifica el origen del cambio (ej: 'Ajuste Masivo (porcentaje)', 'CREACIÓN', 'ACTUALIZACIÓN').
 *  - motivo:          TEXT nullable — descripción adicional del cambio.
 *  - fecha_hora:      DATETIME — timestamp automático de la operación (DEFAULT CURRENT_TIMESTAMP).
 */
export class CreateHistoricoPreciosTable1788100000000 implements MigrationInterface {
  name = 'CreateHistoricoPreciosTable1788100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`historico_precios\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`producto_id\` int NOT NULL,
        \`usuario_id\` int NULL,
        \`precio_anterior\` decimal(12,2) NULL COMMENT 'NULL si es el registro de precio inicial del producto',
        \`precio_nuevo\` decimal(12,2) NOT NULL COMMENT 'Precio resultante después del cambio',
        \`tipo_operacion\` varchar(100) NOT NULL COMMENT 'Origen del cambio de precio (CREACIÓN, ACTUALIZACIÓN, Ajuste Masivo, etc.)',
        \`motivo\` text NULL COMMENT 'Descripción adicional o razón del cambio',
        \`fecha_hora\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_historico_precios_producto_id\` (\`producto_id\`),
        INDEX \`IDX_historico_precios_fecha\` (\`fecha_hora\`),
        CONSTRAINT \`FK_historico_precios_producto\`
          FOREIGN KEY (\`producto_id\`) REFERENCES \`producto\`(\`id\`)
          ON DELETE CASCADE,
        CONSTRAINT \`FK_historico_precios_usuario\`
          FOREIGN KEY (\`usuario_id\`) REFERENCES \`usuario\`(\`id\`)
          ON DELETE SET NULL
      ) ENGINE=InnoDB COMMENT='Registro de auditoría de todos los cambios de precio de productos'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS \`historico_precios\``);
  }
}
