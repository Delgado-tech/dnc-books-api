import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../functions/errorHandler';
import { userSchema } from '../models/userSchema';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default async function auth (req: Request, res: Response, next: NextFunction) {
    if (req.path.includes("/login")) {
        return next();
    }

    const token = req.query.token || req.cookies["auth-token"];

    if (!token) {
        return errorHandler(res, new Error("Undefined Token!"));
    }

    try {
        const decToken = jwt.decode(token) as JwtPayload;
        const userExists = await userSchema.findOne({ _id: decToken });
        if (!userExists) {
            return errorHandler(res, new Error("Invalid Token!"));
        }
    } catch (error) {
        return errorHandler(res, String(error));
    }

    next();
}