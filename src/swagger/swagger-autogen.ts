import autogen from 'swagger-autogen';
import { bookSchema } from '../models/bookSchema';
import mongooseToSwagger from 'mongoose-to-swagger';
import { userSchema } from '../models/userSchema';

const swaggerAutoGen = autogen({
    openapi: '3.0.0',
    language: 'pt-BR',
});

const outputFile = './swagger_output.json';
const endpointsFiles = ['../routes/books.js', '../routes/users.js'];

const doc = {
    info: {
        version: "1.0.0",
        title: "DNC-Books",
        description: "Desc",
    },
    host: "localhost:3000",
    servers: [
        {
            url: "http://localhost:3000",
            description: "Localhost"
        },
        {
            url: "http://boardtasks-back.vercel.app/",
            description: "produção" 
        }
    ],
    consumes: ['aplication/json'],
    produces: ['aplication/json'],
    components:{
        '@schemas': {
            UserData: mongooseToSwagger(userSchema),
            BookData: mongooseToSwagger(bookSchema),
            User: { 
                type: "object",
                required: [ "name", "email", "password" ], 
                properties: { 
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string"},
                    acessLevel: { type: "string", example: "default" },
                }
            },
            Book: { 
                type: "object",
                required: [ "title", "pageCount", "codeISBN", "publisher" ], 
                properties: { 
                    title: { type: "string" },
                    pageCount: { type: "number" },
                    codeISBN: { type: "string", example: "5712211031434" },
                    publisher: { type: "string" },
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

