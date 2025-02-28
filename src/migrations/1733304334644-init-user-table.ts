import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitUserTable1733304334644 implements MigrationInterface {
  name = 'InitUserTable1733304334644';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`id\` bigint NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL DEFAULT 'active', \`avatar\` varchar(255) NULL, \`is_verified_mail\` tinyint NOT NULL DEFAULT 0, \`first_name\` varchar(255) NULL, \`last_name\` varchar(255) NULL, \`role\` varchar(255) NOT NULL, \`gender\` varchar(255) NULL, \`date_of_birth\` date NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
    await queryRunner.query(`DROP TABLE \`users\``);
  }
}
