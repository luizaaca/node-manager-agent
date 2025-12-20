import express from 'express';
import authMiddleware from "../middleware/authMiddleware.js";
import { body, validationResult } from 'express-validator';
import { callAgent } from '../controllers/agentController.js';

const router = express.Router();

router.use(authMiddleware);

const validateAgentQuery = [
    body('prompt')
        .isString()
        .isLength({ min: 1, max: 500 })  // Limit prompt length
        .withMessage('Prompt must be a string between 1 and 500 characters'),
];

/**
 * @swagger
 * /api/agent/query:
 *   post:
 *     summary: Execute a database query using AI agent
 *     description: Sends a natural language prompt to an AI agent that generates and executes a safe SELECT query on the database.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Natural language query prompt (e.g., "List products with price > 10")
 *                 example: "Show me all products with UnitPrice greater than 10"
 *                 minLength: 1
 *                 maxLength: 500
 *             required:
 *               - prompt
 *     responses:
 *       200:
 *         description: Successful query execution
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 response:
 *                   type: string
 *                   description: The agent's response with query results
 *                   example: "[{\"ProductID\":1,\"ProductName\":\"Chai\",\"UnitPrice\":18.0}]"
 *       400:
 *         description: Bad request (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Prompt must be a string between 1 and 500 characters"
 *                       param:
 *                         type: string
 *                         example: "prompt"
 *       401:
 *         description: Unauthorized (missing or invalid JWT token)
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Agent error: Failed to execute query"
 */
router.post('/query', validateAgentQuery, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    await callAgent(req, res);
});

export default router;