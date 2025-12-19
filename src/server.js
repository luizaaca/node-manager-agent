import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";

const app = express();

app.use(express.json());

// Configuração do Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Node Manager Agent API",
            version: "1.0.0",
            description:
                "API para gerenciamento de agentes com autenticação JWT",
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: "Servidor de desenvolvimento",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/routes/*.js", "./src/server.js"], // Caminhos para os arquivos com anotações JSDoc
};

const specs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
    const health = {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        message: "API running!",
    };

    if (!process.env.JWT_SECRET) {
        health.status = "error";
        health.message = "Environment variables not loaded";
        return res.status(500).json(health);
    }

    res.json(health);
});

// Rota protegida (exemplo)
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.email}!`, user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
