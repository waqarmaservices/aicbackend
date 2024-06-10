import { HttpStatus } from '../enum/http-status.enum';

export class ApiResponse<T> {
    success: boolean;
    data: T;
    error: string;
    statusCode: number;
    constructor(
        success: boolean,
        data: T | null,
        error: string | null,
        statusCode: HttpStatus,
    ) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.statusCode = statusCode;
    }
}
