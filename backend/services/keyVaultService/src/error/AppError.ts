export class AppError extends Error {
    code: string;
    status: number;
    metadata?: any;

    constructor(message: string, code: string, status: number, metadata?: any) {
        super(message); // sets message
        this.code = code; // custom error code
        this.status = status; // HTTP status
        this.metadata = metadata;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
