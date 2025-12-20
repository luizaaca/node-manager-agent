import express from "express";
import healthcheck from "express-healthcheck";
import db from "../database/db.js"; // Import your database module (adjust path if needed)

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verifies the API status and database connection
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API and database are running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 message:
 *                   type: string
 *                   example: API and database are healthy!
 *       503:
 *         description: Service unavailable (API or database issue)
 */
router.get("/health", healthcheck({
    healthy: () => ({
        status: "ok",
        uptime: process.uptime(),
        message: "API and database are healthy!",
    }),
    test: async () => {
        try {
            await db.get("SELECT 1");
        } catch (error) {
            throw new Error(`Database check failed: ${error.message}`);
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("Environment variables not loaded");
        }
    },
}));

export default router;