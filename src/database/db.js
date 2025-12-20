import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import https from "https";

sqlite3.verbose();

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || join(__dirname, "northwind.db");
const dbUrl =
    "https://raw.githubusercontent.com/jpwhite3/northwind-SQLite3/main/dist/northwind.db";

function downloadDatabase(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https
            .get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(
                        new Error(`Failed to download: ${response.statusCode}`)
                    );
                    return;
                }
                response.pipe(file);
                file.on("finish", () => {
                    file.close(resolve);
                });
            })
            .on("error", (err) => {
                fs.unlink(dest, () => {}); // Delete partial file
                reject(err);
            });
    });
}

// Ensure the database directory exists
const dbDir = dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Download the database if it doesn't exist
if (!fs.existsSync(dbPath)) {
    console.log("Database file not found. Downloading...");
    try {
        await downloadDatabase(dbUrl, dbPath);
        console.log("Database downloaded successfully.");
    } catch (error) {
        console.error(
            `Error downloading database from ${dbUrl}:`,
            error.message
        );
        process.exit(1);
    }
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
        process.exit(1);
    } else {
        console.log("Connected to SQLite database at:", dbPath);
    }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON", (err) => {
    if (err) {
        console.error("Error enabling foreign keys:", err.message);
    }
});

export default db;
