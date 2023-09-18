import express, { Request, Response } from 'express';
import { userSchema, UserAccessLevel } from '../models/userSchema';
import { errorHandler } from '../functions/errorHandler';
import validator from 'validator';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

router.get("/users", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.parameters['token'] = { in: "query", name: "token", required: false }
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }    
    */

    try {
        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const userLogged = await userSchema.findOne({ _id: token }).select("+accessLevel");

        if (userLogged.accessLevel !== UserAccessLevel.admin) {
            throw new Error("Unauthorized!");
        }
    
        const users = await userSchema.find().select(["+acessLevel", "+token"]);
        res.status(200).json(users);

    } catch (error) {
        errorHandler(res, error);
    }

});

router.get("/users/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.parameters['token'] = { in: "query", name: "token", required: false }
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    try {

        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const userLogged = await userSchema.findOne({ _id: token }).select("+accessLevel");

        if (userLogged.accessLevel !== UserAccessLevel.admin && String(userLogged._id) !== id) {
            throw new Error("Unauthorized!");
        }

        const user = await userSchema.find({ _id: id });
        res.status(200).json(user);

    } catch (error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("User not found!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});

router.post("/users", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.parameters['token'] = { in: "query", name: "token", required: false }
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }
    */

    try {

        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const userLogged = await userSchema.findOne({ _id: token }).select("+accessLevel");

        if (userLogged.accessLevel !== UserAccessLevel.admin) {
            throw new Error("Unauthorized!");
        }

        const { name, email, password, accessLevel } = req.body;


        if (!validator.isEmail(email)) {
            throw new Error("Invalid Email!");
        }

        const hashRounds = 10;
        const hashPassword = await bcrypt.hash(password, hashRounds);

        const dbResponse = await userSchema.create({ name, email, password: hashPassword, accessLevel });
        
        const genToken = jwt.sign(String(dbResponse._id), process.env.JWT_SECRET!);

        res.status(200).json({
            status: "OK",
            message: `User has been created!`,
            response: {
                token: genToken,
                user: dbResponse
            }
        });

    } catch(error) {
        errorHandler(res, error);
    }
});

router.put("/users/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.parameters['token'] = { in: "query", name: "token", required: false }
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }
    */

    const id = req.params.id;

    try {

        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const userLogged = await userSchema.findOne({ _id: token }).select(["+password", "+accessLevel"]);

        if (userLogged.accessLevel !== UserAccessLevel.admin) {
            throw new Error("Unauthorized!");
        }

        const { name, password, accessLevel } = req.body;

        const hashRounds = 10;
        const hashPassword = await bcrypt.hash(password, hashRounds);

        const dbResponse = await userSchema.updateOne({ _id: id }, { name, password: hashPassword, accessLevel });

        if (dbResponse.modifiedCount > 0) {
            const user = await userSchema.findOne({ _id: id });

            res.status(200).json({
                status: "OK",
                message: `User (#${id}) has been updated!`,
                response: user
            });
        }

    } catch(error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("User not found!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});

router.delete("/users/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.parameters['token'] = { in: "query", name: "token", required: false }
    #swagger.responses[200] = { description: "OK" }
    #swagger.responses[400] = { description: "Invalid Request", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    try {

        const token = jwt.decode(String(req.query.token)) as JwtPayload;
        const userLogged = await userSchema.findOne({ _id: token }).select("+accessLevel");

        if (userLogged.accessLevel !== UserAccessLevel.admin) {
            throw new Error("Unauthorized!");
        }

        if (userLogged._id === id) {
            throw new Error("You can't delete your self!");
        }

        const dbResponse = await userSchema.deleteOne({ _id: id });

        if (dbResponse.deletedCount > 0) {
            res.status(200).json({
                status: "OK",
                message: `User (#${id}) has been deleted!`,
                response: dbResponse
            });
        }

    } catch (error) {
        if (String(error).includes("_id")) {
            return errorHandler(res, new Error("User not found!"), { errorTitle: "Not Found", errorStatusCode: 404 });
        }

        errorHandler(res, error);
    }
});



export default router;