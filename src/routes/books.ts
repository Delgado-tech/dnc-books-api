import express, { Request, Response } from 'express';
import { bookSchema } from '../models/bookSchema';
import { errorHandler } from '../functions/errorHandler';

const router = express.Router();

router.get("/books", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/BookData" } }    
    */
    const books = await bookSchema.find();
    res.status(200).json(books);
});

router.get("/books/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/BookData" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    try {
        const book = await bookSchema.find({ _id: id });
        res.status(200).json(book);

    } catch (error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("Book not found!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});

router.post("/books", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[201] = { description: "OK", schema: { $ref: "#/components/schemas/BookData" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } }
    */

    const { title, pageCount, codeISBN, publisher } = req.body;
    try {
        const dbResponse = await bookSchema.create({ title, pageCount, codeISBN, publisher });

        res.status(201).json({
            status: "OK",
            message: "Book has been created!",
            response: dbResponse
        });
    } catch (error) {
        errorHandler(res, error);
    }
});

router.put("/books/:id", async (req: Request, res: Response) => { 
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/BookData" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/Book" } } } }
    */

    const id = req.params.id;
    const { title, pageCount, codeISBN, publisher } = req.body;

    try {
        const dbResponse = await bookSchema.updateOne({ _id: id }, { title, pageCount, codeISBN, publisher });

        if (dbResponse.modifiedCount > 0) {
            const book = await bookSchema.findOne({ _id: id });

            res.status(200).json({
                status: "OK",
                message: `Book (#${id}) has been updated!`,
                response: book
            });
        }

    } catch(error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("Book not found!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});

router.delete("/books/:id",  async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[200] = { description: "OK" }
    #swagger.responses[400] = { description: "Invalid Request", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    try {
        const dbResponse = await bookSchema.deleteOne({ _id: id });

        if (dbResponse.deletedCount > 0) {
            res.status(200).json({
                status: "OK",
                message: `Book (#${id}) has been deleted!`,
                response: dbResponse
            });
        }

    } catch (error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("Book not found!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});

export default router;