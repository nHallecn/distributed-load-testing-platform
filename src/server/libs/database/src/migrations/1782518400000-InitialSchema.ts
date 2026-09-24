import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1782518400000 implements MigrationInterface {
  name = 'InitialSchema1782518400000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
    await queryRunner.query(
      `CREATE TYPE "user_role" AS ENUM ('user', 'admin')`,
    );
    await queryRunner.query(
      `CREATE TYPE "verification_method" AS ENUM ('dns_txt', 'http_file')`,
    );
    await queryRunner.query(
      `CREATE TYPE "verification_status" AS ENUM ('pending', 'verified', 'expired', 'failed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "http_method" AS ENUM ('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "load_test_status" AS ENUM ('draft', 'ready', 'archived')`,
    );
    await queryRunner.query(
      `CREATE TYPE "run_status" AS ENUM ('queued', 'starting', 'running', 'stopping', 'completed', 'failed', 'cancelled')`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar(320) NOT NULL UNIQUE,
        "password_hash" varchar(100) NOT NULL,
        "role" user_role NOT NULL DEFAULT 'user',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "target_verifications" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "hostname" varchar(253) NOT NULL,
        "method" verification_method NOT NULL,
        "token" varchar(100) NOT NULL UNIQUE,
        "status" verification_status NOT NULL DEFAULT 'pending',
        "verified_at" timestamptz,
        "expires_at" timestamptz NOT NULL,
        "last_error" text,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_target_verifications_owner_hostname" ON "target_verifications" ("owner_id", "hostname")`,
    );
    await queryRunner.query(`
      CREATE TABLE "load_tests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "owner_id" uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "target_verification_id" uuid REFERENCES target_verifications(id) ON DELETE RESTRICT,
        "name" varchar(120) NOT NULL,
        "target_url" text NOT NULL,
        "method" http_method NOT NULL,
        "headers" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "body" jsonb,
        "virtual_users" integer NOT NULL CHECK ("virtual_users" > 0),
        "duration_seconds" integer NOT NULL CHECK ("duration_seconds" > 0),
        "ramp_up_seconds" integer NOT NULL DEFAULT 0 CHECK ("ramp_up_seconds" >= 0),
        "expected_response_time_ms" integer,
        "stop_conditions" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "status" load_test_status NOT NULL DEFAULT 'draft',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "chk_ramp_within_duration" CHECK ("ramp_up_seconds" <= "duration_seconds")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_load_tests_owner_created" ON "load_tests" ("owner_id", "created_at" DESC)`,
    );
    await queryRunner.query(`
      CREATE TABLE "test_runs" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "test_id" uuid NOT NULL REFERENCES load_tests(id) ON DELETE CASCADE,
        "requested_by" uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        "status" run_status NOT NULL DEFAULT 'queued',
        "desired_workers" integer NOT NULL CHECK ("desired_workers" > 0),
        "started_at" timestamptz,
        "ended_at" timestamptz,
        "stop_reason" text,
        "total_requests" bigint NOT NULL DEFAULT 0,
        "successful_requests" bigint NOT NULL DEFAULT 0,
        "failed_requests" bigint NOT NULL DEFAULT 0,
        "average_latency_ms" double precision,
        "p95_latency_ms" double precision,
        "p99_latency_ms" double precision,
        "error_rate_percent" double precision,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_test_runs_test_created" ON "test_runs" ("test_id", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_one_active_run_per_test" ON "test_runs" ("test_id") WHERE "status" IN ('queued', 'starting', 'running', 'stopping')`,
    );
    await queryRunner.query(`
      CREATE TABLE "workers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "run_id" uuid NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
        "worker_key" varchar(150) NOT NULL,
        "executor_key" varchar(200),
        "capacity" integer NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'assigned',
        "last_heartbeat_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        UNIQUE ("run_id", "worker_key")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "metric_snapshots" (
        "id" bigserial PRIMARY KEY,
        "run_id" uuid NOT NULL REFERENCES test_runs(id) ON DELETE CASCADE,
        "worker_id" uuid REFERENCES workers(id) ON DELETE SET NULL,
        "recorded_at" timestamptz NOT NULL,
        "requests_per_second" double precision NOT NULL,
        "total_requests" bigint NOT NULL,
        "failed_requests" bigint NOT NULL,
        "p95_latency_ms" double precision NOT NULL,
        "latency_sum_ms" double precision NOT NULL,
        "latency_buckets" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "active_virtual_users" integer NOT NULL,
        "status_codes" jsonb NOT NULL DEFAULT '{}'::jsonb
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_metric_snapshots_run_recorded" ON "metric_snapshots" ("run_id", "recorded_at")`,
    );
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" bigserial PRIMARY KEY,
        "actor_id" uuid REFERENCES users(id) ON DELETE SET NULL,
        "action" varchar(100) NOT NULL,
        "resource_type" varchar(100) NOT NULL,
        "resource_id" uuid,
        "metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "ip_address" inet,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_audit_logs_actor_created" ON "audit_logs" ("actor_id", "created_at" DESC)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "audit_logs"');
    await queryRunner.query('DROP TABLE IF EXISTS "metric_snapshots"');
    await queryRunner.query('DROP TABLE IF EXISTS "workers"');
    await queryRunner.query('DROP TABLE IF EXISTS "test_runs"');
    await queryRunner.query('DROP TABLE IF EXISTS "load_tests"');
    await queryRunner.query('DROP TABLE IF EXISTS "target_verifications"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
    await queryRunner.query('DROP TYPE IF EXISTS "run_status"');
    await queryRunner.query('DROP TYPE IF EXISTS "load_test_status"');
    await queryRunner.query('DROP TYPE IF EXISTS "http_method"');
    await queryRunner.query('DROP TYPE IF EXISTS "verification_status"');
    await queryRunner.query('DROP TYPE IF EXISTS "verification_method"');
    await queryRunner.query('DROP TYPE IF EXISTS "user_role"');
  }
}
