import express, { Request, Response } from 'express';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';
import cookieParse from 'cookie-parser';
import dotenv from 'dotenv';
import loginRouter from './routes/login';
import booksRouter from './routes/books';
import usersRouter from './routes/users';
import fs from 'fs';
import dbConnect from './middlewares/db-connect';
import auth from './middlewares/auth';

const swaggerFile = JSON.parse(fs.readFileSync('./dist/swagger/swagger_output.json', { encoding: "utf-8" }));

const app = express();
const port = 3000;

dotenv.config();

app.use(cors());
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParse());

app.get("/", (req: Request, res: Response) => {
    res.redirect("/docs");
});

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerFile, {
    customJs: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.min.js',
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.css',
}));

app.use(dbConnect, auth, loginRouter);
app.use(dbConnect, auth, booksRouter);
app.use(dbConnect, auth, usersRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});