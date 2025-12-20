import express from "express";
import { query, param, validationResult } from "express-validator";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getProducts,
    getProductById,
} from "../controllers/productController.js";

/* Validations */
const validateGetProducts = [
    query("page")
        .optional()
        .isInt({ min: 1 })
        .toInt()
        .withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 50 })
        .toInt()
        .withMessage("Limit must be an integer between 1 and 50"),
];

const validateGetProductId = [
    param('id')
        .isInt({ min: 1 })
        .toInt()
        .withMessage('ID must be a positive integer'),
];
/* End Validations */

const router = express.Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get paginated list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page (max 50)
 *     responses:
 *       200:
 *         description: List of products with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProductID:
 *                         type: integer
 *                       ProductName:
 *                         type: string
 *                       UnitPrice:
 *                         type: number
 *                       UnitsInStock:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get("/", validateGetProducts, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    await getProducts(req, res);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     ProductID:
 *                       type: integer
 *                     ProductName:
 *                       type: string
 *                     UnitPrice:
 *                       type: number
 *                     UnitsInStock:
 *                       type: integer
 *       404:
 *         description: Product not found
 */
router.get("/:id", validateGetProductId, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({ errors: errors.array() });

    await getProductById(req, res);
});

export default router;

