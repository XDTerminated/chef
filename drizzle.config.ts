import * as dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
    schema: "./lib/db/schema.ts",
    out: "./lib/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
