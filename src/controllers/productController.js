import {
    getProductsFromDB,
    getProductByIdFromDB,
} from "../services/productService.js";

const getProducts = async (req, res) => {
    try {
        let { page = 1, limit = 10 } = req.query;
        
        const { rows, totalItems, totalPages } = await getProductsFromDB(
            page,
            limit
        );

        res.json({
            data: rows,
            pagination: { totalItems, totalPages, currentPage: page, limit },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const row = await getProductByIdFromDB(id);
        if (!row) return res.status(404).json({ error: "Product not found" });
        res.json({ data: row });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getProducts, getProductById };
