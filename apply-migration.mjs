import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function applyMigration() {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DATABASE_URL?.split("@")[1]?.split(":")[0] || "localhost",
      user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
      password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
      database: process.env.DATABASE_URL?.split("/").pop()?.split("?")[0] || "terabayt",
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log("Applying migrations...");

    // Read and execute SQL files
    const sqlFiles = ["0001_mixed_zaladane.sql", "0002_superb_ikaris.sql"];

    for (const file of sqlFiles) {
      const filePath = path.join("drizzle", file);
      if (fs.existsSync(filePath)) {
        const sql = fs.readFileSync(filePath, "utf-8");
        const statements = sql.split("--> statement-breakpoint").filter((s) => s.trim());

        for (const statement of statements) {
          const trimmed = statement.trim();
          if (trimmed) {
            try {
              await connection.execute(trimmed);
              console.log(`✓ Executed: ${trimmed.substring(0, 50)}...`);
            } catch (err) {
              // Ignore "table already exists" errors
              if (err?.sqlState === "42S01") {
                console.log(`⊘ Table already exists: ${trimmed.substring(0, 50)}...`);
              } else {
                throw err;
              }
            }
          }
        }
      }
    }

    console.log("✓ Migrations applied successfully!");
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error?.message || error);
    process.exit(1);
  }
}

applyMigration();
