import express, { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../functions/errorHandler';
import { userSchema } from '../models/userSchema';
import jwt from 'jsonwebtoken';

export default async function auth (req: Request, res: Response, next: NextFunction) {
    const token = req.query.token || req.cookies["auth-token"];
    next();
    return;
    if (!token) {
        return errorHandler(res, new Error("Undefined Token!"));
    }

    const decoded = jwt.decode(token);
    console.log(decoded);
    //if (jwt.verify(decoded!.id, process.env.JWT_SECRET!))

    //const userExists = await userSchema.findOne({ _id });


    next();
} 