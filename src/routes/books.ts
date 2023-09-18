import express, { Request, Response } from 'express';
import { bookSchema } from '../models/bookSchema';
import { errorHandler } from '../functions/errorHandler';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UserAccessLevel, userSchema } from '../models/userSchema';

const router = express.Router();

router.get("/books", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/BookData" } }    
    */
    try {
        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const user = await userSchema.findOne({ _id: token });

        if (!user) {
            throw new Error("Invalid Token!");
        }

        const books = await bookSchema.find();
        res.status(200).json(books);

    } catch (error) {
        errorHandler(res, error);
    }
});

router.get("/books/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Books']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/BookData" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    try {
        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const user = await userSchema.findOne({ _id: token });

        if (!user) {
            throw new Error("Invalid Token!");
        }

        const book = await bookSchema.find({ bookId: id });
        res.status(200).json(book);

    } catch (error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("Livro não encontrado!"), { errorTitle: "Not Found", errorStatusCode: 404 });
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

    const { bookId, title, pageCount, codeISBN, publisher } = req.body;
    try {
        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const user = await userSchema.findOne({ _id: token });

        if (!user) {
            throw new Error("Invalid Token!");
        }

        const dbResponse = await bookSchema.create({ bookId, title, pageCount, codeISBN, publisher, userID: user._id });

        res.status(201).json({
            status: "OK",
            message: "O Livro foi cadastrado com sucesso!",
            response: dbResponse
        });
    } catch (error) {

        if (String(error).includes("bookId_1 dup key")){
            return errorHandler(res, new Error("O id informado já está em uso, escolha outro!"));
        }

        if (String(error).includes("codeISBN_1 dup key")){
            return errorHandler(res, new Error("O código ISBN informado já está em uso, escolha outro!"));
        }

        if (String(error).includes("ValidationError: codeISBN:")){
            return errorHandler(res, new Error("O código ISBN deve conter 13 caracteres!"));
        }

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
    const { bookId, title, pageCount, codeISBN, publisher } = req.body;

    try {
        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const user = await userSchema.findOne({ _id: token }).select("+accessLevel");

        if (!user) {
            throw new Error("Invalid Token!");
        }

        if (user.accessLevel !== UserAccessLevel.admin) {
            const bookExist = await bookSchema.findOne({ userID: user._id });
            if (!bookExist) {
                throw new Error("O livro não existe ou você não tem acesso suficiente para editá-lo!");
            }
        }

        const dbResponse = await bookSchema.updateOne({ bookId: id }, { bookId, title, pageCount, codeISBN, publisher }).populate("userID");

        if (dbResponse.modifiedCount > 0) {
            const book = await bookSchema.findOne({ bookId: id });

            res.status(200).json({
                status: "OK",
                message: `O livro (#${id}) foi atualizado com sucesso!`,
                response: book
            });
        }

    } catch(error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("O Livro não foi encontrado!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        if (String(error).includes("bookId_1 dup key")){
            return errorHandler(res, new Error("O id informado já está em uso, escolha outro!"));
        }

        if (String(error).includes("codeISBN_1 dup key")){
            return errorHandler(res, new Error("O código ISBN informado já está em uso, escolha outro!"));
        }

        if (String(error).includes("ValidationError: codeISBN:")){
            return errorHandler(res, new Error("O código ISBN deve conter 13 caracteres!"));
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
        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const user = await userSchema.findOne({ _id: token });

        if (!user) {
            throw new Error("Invalid Token!");
        }

        if (user.accessLevel !== UserAccessLevel.admin) {
            const bookExist = await bookSchema.findOne({ userID: user._id });
            if (!bookExist) {
                throw new Error("O livro não existe ou você não tem acesso suficiente para deleta-lo!");
            }
        }

        const dbResponse = await bookSchema.deleteOne({ bookId: id });

        if (dbResponse.deletedCount > 0) {
            res.status(200).json({
                status: "OK",
                message: `O livro (#${id}) foi deletado com sucesso!`,
                response: dbResponse
            });
        }

    } catch (error) {
        if (String(error).includes("bookId")) {
            return errorHandler(res, new Error("O livro não foi encontrado!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});

export default router;