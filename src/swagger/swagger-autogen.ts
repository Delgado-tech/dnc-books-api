import autogen from 'swagger-autogen';
import { bookSchema } from '../models/bookSchema';
import mongooseToSwagger from 'mongoose-to-swagger';
import { userSchema } from '../models/userSchema';

const swaggerAutoGen = autogen({
    openapi: '3.0.0',
    language: 'pt-BR',
});

const outputFile = './swagger_output.json';
const endpointsFiles = ['../routes/login.js', '../routes/books.js', '../routes/users.js'];

const doc = {
    info: {
        version: "1.0.0",
        title: "DNC-Books",
        description: "API de registro de livros",
    },
    host: "localhost:3000",
    servers: [
        {
            url: "https://dnc-books-api.vercel.app",
            description: "Production" 
        },
        {
            url: "http://localhost:3000",
            description: "Localhost"
        },
    ],
    consumes: ['aplication/json'],
    produces: ['aplication/json'],
    components:{
        '@schemas': {
            UserData: mongooseToSwagger(userSchema),
            BookData: mongooseToSwagger(bookSchema),
            Login: {
                type: "object",
                required: [ "email", "password" ], 
                properties: { 
                    email: { type: "string" },
                    password: { type: "string"},
                }
            },
            ChangePassword: {
                type: "object",
                required: [ "email", "password", "newPassword" ], 
                properties: { 
                    email: { type: "string" },
                    password: { type: "string"},
                    newPassword: { type: "string"},
                }
            },
            Token: {
                type: "string",
                properties: { 
                    token: { type: "string" },
                }
            },
            User: { 
                type: "object",
                required: [ "name", "email", "password" ], 
                properties: { 
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string"},
                    accessLevel: { type: "string", example: "default" },
                }
            },
            Book: { 
                type: "object",
                required: [ "title", "pageCount", "codeISBN", "publisher" ], 
                properties: { 
                    bookId: { type: "number" },
                    title: { type: "string" },
                    pageCount: { type: "number" },
                    codeISBN: { type: "string", example: "5712211031434" },
                    publisher: { type: "string" },
                    userID: { type: "string" }
                }
            },
            ErrorMessage: {
                type: "object",
                properties: {
                    title: { type: "string", example: "Error" },
                    message: { type: "string", example: "Error: Something went wrong!" }
                }
            }
        }
    }
    // components: {
    //     schemas: {
    //         Usuario: mongooseToSwagger(EsquemaUsuario),
    //         Tarefa: mongooseToSwagger(EsquemaTarefa),
    //     }
    // }
}

swaggerAutoGen(outputFile, endpointsFiles, doc);

