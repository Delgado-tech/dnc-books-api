import mongoose, { ConnectOptions } from "mongoose";
import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../functions/errorHandler";

export default async function dbConnect(req: Request, res: Response, next: NextFunction) {
    try {
        mongoose.connect(process.env.MONGODB_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as ConnectOptions);

        console.log("Connected to Database!");

        try {
            next();
        } catch {}

        return mongoose;

    } catch (error) {
        errorHandler(res, new Error("Could not possible to connect to database!"));
    }
}