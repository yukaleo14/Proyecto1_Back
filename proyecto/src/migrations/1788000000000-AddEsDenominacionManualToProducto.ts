import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Agrega la columna es_denominacion_manual a la tabla producto.
 *
 * Alcance Técnico:
 * - es_denominacion_manual (TINYINT / BOOLEAN NOT NULL DEFAULT 0):
 *   Indica si la denominación del producto fue personalizada manualmente por el usuario.
 *   Si es 0 (false), la denominación se regenera automáticamente al cambiar Marca, Línea o Presentación.
 */
export class AddEsDenominacionManualToProducto1788000000000 implements MigrationInterface {
  name = 'AddEsDenominacionManualToProducto1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`producto\` ADD \`es_denominacion_manual\` tinyint NOT NULL DEFAULT 0 COMMENT 'Indica si la denominación fue editada manualmente'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`producto\` DROP COLUMN \`es_denominacion_manual\``,
    );
  }
}
