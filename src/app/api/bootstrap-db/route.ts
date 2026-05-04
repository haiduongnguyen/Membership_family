import { NextResponse } from "next/server";
import { Client } from "pg";
import fs from "node:fs/promises";
import path from "node:path";
import dns from "node:dns/promises";

export const runtime = "nodejs";

const REQUIRED_TABLES = [
  "users",
  "relationship_groups",
  "persons",
  "relationships",
  "events",
  "event_participants",
  "photos",
  "notes",
] as const;

async function readMigration(fileName: string) {
  const fullPath = path.join(process.cwd(), "supabase", "migrations", fileName);
  const sql = await fs.readFile(fullPath, "utf8");
  return sql.charCodeAt(0) === 0xfeff ? sql.slice(1) : sql;
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Bootstrap endpoint is disabled in production" }, { status: 403 });
  }

  const databaseUrl = process.env.SUPABASE_DB_URL ?? process.env.POSTGRES_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "Missing SUPABASE_DB_URL (or POSTGRES_URL)" }, { status: 500 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    return NextResponse.json({ error: "SUPABASE_DB_URL is not a valid URL" }, { status: 500 });
  }

  const isSupabaseHost = parsedUrl.hostname.endsWith(".supabase.co");
  if (isSupabaseHost && !parsedUrl.searchParams.get("sslmode")) {
    parsedUrl.searchParams.set("sslmode", "require");
  }

  let resolvedHost = parsedUrl.hostname;
  if (isSupabaseHost) {
    try {
      const ipv4List = await dns.resolve4(parsedUrl.hostname);
      if (ipv4List.length > 0) {
        resolvedHost = ipv4List[0];
      }
    } catch {
      // Keep hostname fallback when IPv4 lookup fails.
    }
  }

  const client = new Client({
    connectionString: parsedUrl.toString(),
    host: resolvedHost,
    ssl: isSupabaseHost ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();

    const tableChecks = await Promise.all(
      REQUIRED_TABLES.map(async (tableName) => {
        const result = await client.query<{ exists: string | null }>(
          "select to_regclass($1) as exists",
          [`public.${tableName}`],
        );
        return { tableName, exists: Boolean(result.rows[0]?.exists) };
      }),
    );

    const missingTables = tableChecks.filter((item) => !item.exists).map((item) => item.tableName);
    if (missingTables.length === 0) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const sql = [
      await readMigration("001_init.sql"),
      await readMigration("002_auth_trigger.sql"),
      await readMigration("003_rls.sql"),
    ].join("\n\n");
    await client.query(sql);

    return NextResponse.json({ ok: true, createdMissingTables: missingTables });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown bootstrap error";
    if (message.includes("getaddrinfo")) {
      return NextResponse.json(
        {
          error: `Cannot resolve/connect DB host (${parsedUrl.hostname}). Please use Supabase Database connection string (Session/Direct) in SUPABASE_DB_URL.`,
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    await client.end().catch(() => undefined);
  }
}
