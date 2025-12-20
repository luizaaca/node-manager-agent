import "dotenv/config";
import express from "express";
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import productRoutes from "./routes/productRoutes.js";
import agentRoutes from './routes/agentRoutes.js';
import setupSwagger from "./config/swagger.js";
import { logger, errorLogger } from "./middleware/loggerMiddleware.js";

const app = express();

app.use(express.json());
app.use(logger);
setupSwagger(app);

app.use("/", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use('/api/agent', agentRoutes);

app.use(errorLogger);
app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
