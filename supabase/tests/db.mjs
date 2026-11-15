// Test database helper. Uses DATABASE_URL when set (CI); otherwise starts a throwaway local
// Postgres cluster. Each test file gets a fresh database with the bootstrap and all migrations.
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = fileURLToPath(new URL('..', import.meta.url));
const pgBin = process.env.PG_BIN ?? '/usr/lib/postgresql/16/bin';

function asPostgresUser(command, args) {
  // initdb refuses to run as root; in root sandboxes run the server as the postgres user.
  if (process.getuid?.() === 0) {
    execFileSync('runuser', ['-u', 'postgres', '--', command, ...args], { stdio: 'ignore' });
  } else {
    execFileSync(command, args, { stdio: 'ignore' });
  }
}

async function startLocalCluster() {
  const dir = mkdtempSync(join(tmpdir(), 'exam-quest-pg-'));
  chmodSync(dir, 0o700);
  if (process.getuid?.() === 0) {
    execFileSync('chown', ['postgres:postgres', dir]);
  }
  asPostgresUser(join(pgBin, 'initdb'), ['-D', dir, '-A', 'trust', '-U', 'postgres']);
  asPostgresUser(join(pgBin, 'pg_ctl'), [
    '-D',
    dir,
    '-o',
    `-c listen_addresses='' -k ${dir}`,
    '-w',
    'start',
  ]);
  return {
    config: { host: dir, user: 'postgres', database: 'postgres' },
    stop: () => {
      asPostgresUser(join(pgBin, 'pg_ctl'), ['-D', dir, '-m', 'immediate', 'stop']);
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

function migrationFiles() {
  const dir = join(root, 'migrations');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => readFileSync(join(dir, name), 'utf8'));
}

/** Creates a fresh database with the bootstrap and migrations applied. */
export async function createTestDatabase() {
  const server = process.env.DATABASE_URL
    ? { config: { connectionString: process.env.DATABASE_URL }, stop: () => {} }
    : await startLocalCluster();

  const admin = new pg.Client(server.config);
  await admin.connect();
  const name = `test_${process.pid}_${Date.now()}`;
  await admin.query(`create database ${name}`);
  await admin.end();

  const dbConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL.replace(/\/[^/]*$/, `/${name}`) }
    : { ...server.config, database: name };
  const client = new pg.Client(dbConfig);
  await client.connect();
  try {
    await client.query(readFileSync(join(root, 'tests', 'bootstrap.sql'), 'utf8'));
  } catch (error) {
    // Roles are cluster-wide; on a shared server they may already exist from another run.
    if (!String(error.message).includes('already exists')) throw error;
    await client.query(
      readFileSync(join(root, 'tests', 'bootstrap.sql'), 'utf8').replace(/create role [^;]+;/g, ''),
    );
  }
  for (const sql of migrationFiles()) await client.query(sql);

  /** Runs one query as a Supabase role, optionally signed in as `userId`. Rolls back after. */
  async function as(role, userId, sql, params = []) {
    await client.query('begin');
    try {
      await client.query(`set local role ${role}`);
      await client.query(`select set_config('request.jwt.claim.sub', $1, true)`, [userId ?? '']);
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      await client.query('rollback');
    }
  }

  return {
    /** Superuser query (setup only). */
    query: (sql, params) => client.query(sql, params).then((result) => result.rows),
    asStudent: (userId, sql, params) => as('authenticated', userId, sql, params),
    asAnon: (sql, params) => as('anon', null, sql, params),
    asService: (sql, params) => as('service_role', null, sql, params),
    close: async () => {
      await client.end();
      server.stop();
    },
  };
}
