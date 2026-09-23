import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Agrega columnas de Presentación al Agregado Producto.
 *
 * Contexto DDD: La Presentación es un Value Object compuesto (valor + unidad) que
 * se persiste como dos columnas en la tabla producto, en lugar de una referencia
 * a otra tabla, dado que en el dominio no tiene identidad propia y se define
 * únicamente por sus atributos.
 *
 * Columnas agregadas:
 *  - presentacion_valor: DECIMAL(12,3) - Valor numérico (ej. 1.5, 354, 6). NULL si no tiene presentación.
 *  - presentacion_unidad: VARCHAR(30)   - Unidad de medida (ej. 'L', 'ml', 'kg', 'pack').  NULL si no tiene presentación.
 */
export class AddPresentacionToProducto1787800000000 implements MigrationInterface {
  name = 'AddPresentacionToProducto1787800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`producto\` ADD \`presentacion_valor\` DECIMAL(12,3) NULL COMMENT 'Valor numérico del VO Presentacion (ej. 1.5 para 1.5L)'`,
    );

    await queryRunner.query(
      `ALTER TABLE \`producto\` ADD \`presentacion_unidad\` VARCHAR(30) NULL COMMENT 'Unidad del VO Presentacion (ej. L, ml, kg, pack)'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`producto\` DROP COLUMN \`presentacion_unidad\``,
    );

    await queryRunner.query(
      `ALTER TABLE \`producto\` DROP COLUMN \`presentacion_valor\``,
    );
  }
}
