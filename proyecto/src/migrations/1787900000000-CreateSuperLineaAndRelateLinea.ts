import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migración: Creación de la entidad/tabla SuperLinea y relación obligatoria con Linea
 * con restricción de integridad referencial ON DELETE RESTRICT.
 *
 * Alcance Técnico:
 * 1. Crea la tabla `super_linea` con id, nombre, descripcion y metadatos de auditoría.
 * 2. Agrega la columna `super_linea_id` a la tabla `linea` como obligatoria (NOT NULL).
 * 3. Añade la restricción de clave foránea FK_linea_super_linea con regla ON DELETE RESTRICT.
 */
export class CreateSuperLineaAndRelateLinea1787900000000 implements MigrationInterface {
  name = 'CreateSuperLineaAndRelateLinea1787900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Crear tabla super_linea
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS \`super_linea\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`nombre\` varchar(255) NOT NULL,
        \`descripcion\` text NULL,
        \`sistema\` int NOT NULL DEFAULT 0,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        UNIQUE INDEX \`IDX_super_linea_nombre_deleted\` (\`nombre\`, \`deletedAt\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB
    `);

    // 2. Insertar una super_linea general por defecto si no existe (para asegurar integridad si existían líneas)
    await queryRunner.query(`
      INSERT INTO \`super_linea\` (\`id\`, \`nombre\`, \`descripcion\`, \`sistema\`)
      SELECT 1, 'General', 'SuperLínea general por defecto', 1
      WHERE NOT EXISTS (SELECT 1 FROM \`super_linea\` WHERE \`id\` = 1)
    `);

    // 3. Agregar columna super_linea_id a linea
    await queryRunner.query(`
      ALTER TABLE \`linea\` ADD \`super_linea_id\` int NOT NULL DEFAULT 1 COMMENT 'ID de la SuperLínea obligatoria a la que pertenece la Línea'
    `);

    // 4. Agregar clave foránea con ON DELETE RESTRICT
    await queryRunner.query(`
      ALTER TABLE \`linea\`
      ADD CONSTRAINT \`FK_linea_super_linea\`
      FOREIGN KEY (\`super_linea_id\`)
      REFERENCES \`super_linea\`(\`id\`)
      ON DELETE RESTRICT
      ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`linea\` DROP FOREIGN KEY \`FK_linea_super_linea\``);
    await queryRunner.query(`ALTER TABLE \`linea\` DROP COLUMN \`super_linea_id\``);
    await queryRunner.query(`DROP TABLE IF EXISTS \`super_linea\``);
  }
}
