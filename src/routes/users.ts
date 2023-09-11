import express, { Request, Response } from 'express';
import { userSchema, UserAcessLevel } from '../models/userSchema';
import { errorHandler } from '../functions/errorHandler';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import mongoose, { ObjectId } from 'mongoose';

const router = express.Router();

router.get("/users", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }    
    */

    try {

        // const token = req.params.token;
    
        // const decodedToken = jwt.decode(token);
        // const user = await userSchema.findOne({ _id: decodedToken }).select("+acessLevel");

        // if (user.acessLevel !== UserAcessLevel.admin) {
        //     throw new Error("Unauthorized!");
        // }
    
        const users = await userSchema.find();
        res.status(200).json(users);

    } catch (error) {
        errorHandler(res, error);
    }

});

router.get("/users/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    try {
        const book = await userSchema.find({ _id: id });
        res.status(200).json(book);

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
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }
    */

    const { name, email, password, acessLevel } = req.body;

    try {
        if (!validator.isEmail(email)) {
            throw new Error("Invalid Email!");
        }

        const dbResponse = await userSchema.create({ name, email, password, acessLevel });
        //const user = await userSchema.findOne({ email });

        //const token = jwt.sign(user._id, process.env.JWT_SECRET!);

        //await userSchema.updateOne({ email }, { token });


        res.status(200).json({
            status: "OK",
            message: `User has been created!`,
            response: dbResponse
        });

    } catch(error) {
        errorHandler(res, error);
    }
});

router.put("/users/:id", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }
    */

    const id = req.params.id;
    const { name, password, acessLevel } = req.body;

    try {
        const dbResponse = await userSchema.updateOne({ _id: id }, { name, password, acessLevel });

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

router.put("/users/:id/regentoken", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/UserData" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } }
    */
   
    const id = req.params.id;
    try {
        const maxAttempts = 10;
        let attempts = 1;
        let sucessRegen = false;
        let newId = "";

        while(!sucessRegen) {
            newId = String(new mongoose.Types.ObjectId());
            
            const user = await userSchema.findOne({ _id: newId });
            if (user) {
                if (attempts >= maxAttempts) {
                    throw new Error("Unable to regenerate your token, please try again");
                }

                attempts++;
                continue;
            }

            sucessRegen = true;
        }

        const newToken = jwt.sign(newId, process.env.JWT_SECRET!);

        const dbResponse = await userSchema.updateOne({ _id: id }, { _id: newId, token: newToken });

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

router.delete("/users/:id/:token?", async (req: Request, res: Response) => {
    /* 
    #swagger.tags = ['Users']
    #swagger.parameters['token?'] = { name: "token", required: false }
    #swagger.responses[200] = { description: "OK" }
    #swagger.responses[400] = { description: "Invalid Request", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.responses[404] = { description: "Not Found", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    */

    const id = req.params.id;
    const token = req.params.token;
    try {

        const decodedToken = jwt.decode(token);
        const user = await userSchema.findOne({ _id: decodedToken }).select("+acessLevel");

        if (user.acessLevel !== UserAcessLevel.admin) {
            throw new Error("Unauthorized!");
        }

        if (id === decodedToken) {
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