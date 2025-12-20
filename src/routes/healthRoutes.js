import express from "express";
import { promisify } from "util";
import db from "../database/db.js";

const router = express.Router();
const dbGet = promisify(db.get.bind(db));

router.get("/health", async (req, res) => {
    try {
        try {
            console.log("Checking database...");
            await dbGet("SELECT 1"); // Testa conexão com DB
            console.log("Database OK");
        } catch (error) {
            throw new Error(`Database check failed: ${error.message}`);
        }

        if (
            !process.env.LANGSMITH_PROJECT ||
            !process.env.AZURE_OPENAI_API_KEY
        ) {
            throw new Error("Environment variables not loaded ");
        }

        res.json({
            status: "ok",
            uptime: process.uptime(),
            message: "API and database are healthy!",
        });
    } catch (error) {
        console.error("Health check failed:", error.message);
        res.status(503).json({
            error: `Service unavailable: ${error.message}`,
        });
    }
});

export default router;
