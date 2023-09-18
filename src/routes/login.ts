import express, { Request, Response } from 'express';
import { userSchema } from '../models/userSchema';
import { errorHandler } from '../functions/errorHandler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post("/login", async (req: Request, res: Response) => { 
    /* 
    #swagger.tags = ['Login']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/Token" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/Login" } } } }
    */
    
    const { email, password } = req.body;

    try {
        const user = await userSchema.findOne({ email }).select("+password");
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new Error("Wrong Email or Password!");
        }

        const token = jwt.sign(String(user._id), process.env.JWT_SECRET!);

        res.status(200).json({
            token: token,
        });


    } catch (error) {
        errorHandler(res, error);
    }

});

router.put("/login/changePassword", async (req: Request, res: Response) => { 
    /* 
    #swagger.tags = ['Login']
    #swagger.responses[200] = { description: "OK", schema: { $ref: "#/components/schemas/Token" } }
    #swagger.responses[400] = { description: "Invalid Body", schema: { $ref: "#/components/schemas/ErrorMessage" } }
    #swagger.requestBody = { content: { "application/json": { schema: { $ref: "#/components/schemas/ChangePassword" } } } }
    */
    
    const { email, password, newPassword } = req.body;

    try {

        

        const user = await userSchema.findOne({ email }).select("+password");
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            throw new Error("Wrong Email or Password!");
        }

        const hashRounds = 10;
        const hashPassword = await bcrypt.hash(newPassword, hashRounds);

        const dbResponse = await userSchema.updateOne({ email }, { password: hashPassword });

        res.status(200).json({
            newPassword,
            response: dbResponse,
        });


    } catch (error) {
        errorHandler(res, error);
    }

});



export default router;