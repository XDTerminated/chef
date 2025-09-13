import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Fix for "localStorage is not defined" in React Native
if (typeof global !== "undefined") {
    global.localStorage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {},
        key: () => null,
        length: 0,
    };
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
