import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    return NextResponse.json(
      {
        status: "pending_config",
        message: "DATABASE_URL is not set yet in environment variables.",
        database_connected: false,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  try {
    const url = new URL(dbUrl.replace(/^mysql:\/\//, "http://"));
    const host = url.hostname;
    const port = url.port ? parseInt(url.port, 10) : 3306;
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace(/^\//, "");
    const sslMode = url.searchParams.get("sslaccept");

    const connectionConfig: mysql.ConnectionOptions = {
      host,
      port,
      user,
      password,
      database,
      connectTimeout: 5000,
    };

    if (sslMode || host.includes("tidbcloud.com")) {
      connectionConfig.ssl = {
        minVersion: "TLSv1.2",
        rejectUnauthorized: true,
      };
    }

    const connection = await mysql.createConnection(connectionConfig);
    const [rows]: any = await connection.execute("SHOW TABLES;");
    const tables: string[] = [];
    if (Array.isArray(rows) && rows.length > 0) {
      const firstRow = rows[0] as Record<string, any>;
      const tableKey = Object.keys(firstRow)[0];
      if (tableKey) {
        for (const row of rows as Record<string, any>[]) {
          if (row[tableKey]) {
            tables.push(String(row[tableKey]));
          }
        }
      }
    }

    await connection.end();

    return NextResponse.json({
      status: "ok",
      database_connected: true,
      database_name: database,
      tables_count: tables.length,
      sample_tables: tables.slice(0, 10),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        database_connected: false,
        error: error.message || "Failed to connect to database",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
