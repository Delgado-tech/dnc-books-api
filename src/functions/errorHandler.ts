import { Response } from "express";

interface errorOptions {
    errorTitle?: string,
    errorPrefix?: string,
    errorStatusCode?: number
}

function errorResponse(res: Response, error: any, options?: errorOptions) {
    options = options ? options : {};

    return res.status(options.errorStatusCode || 400).json({
        title: (options.errorTitle || "Error"),
        message: (options.errorPrefix || "") + String(error).replace("Error: ", "")
    });
}

export function errorHandler(res: Response, error: any, options?: errorOptions) {
    // <=== Mongoose Error ===>
    if (String(error).includes("ValidationError: ")) {
        return errorResponse(res, error, options);
    }

    // <=== Expected Error ===>
    if (String(error).includes("Error: ")) {
        return errorResponse(res, error, options);
    }

    // <=== Unexpected Error ===>
    errorResponse(res, error, { errorPrefix: "(Unexpected Error) " });
    console.log(error);
}