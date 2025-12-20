import db from "../database/db.js";
import { promisify } from "util";

const dbGet = promisify(db.get.bind(db));
const dbAll = promisify(db.all.bind(db));

export const getProductsFromDB = async (page, limit) => {
    const offset = (page - 1) * limit;
    const countQuery = "SELECT COUNT(*) as total FROM Products";
    const dataQuery =
        "SELECT ProductID, ProductName, UnitPrice, UnitsInStock FROM Products LIMIT ? OFFSET ?";

    try {
        const countResult = await dbGet(countQuery, []);
        const totalItems = countResult.total;
        const totalPages = Math.ceil(totalItems / limit);

        const rows = await dbAll(dataQuery, [limit, offset]);

        return { rows, totalItems, totalPages };
    } catch (error) {
        throw error;
    }
};

export const getProductByIdFromDB = async (id) => {
    const query = "SELECT * FROM Products WHERE ProductID = ?";
    try {
        const row = await dbGet(query, [id]);
        return row;
    } catch (error) {
        throw error;
    }
};
