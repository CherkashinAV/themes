export type ApiErrorCode = |
    'BAD_REQUEST' |
    'NOT_FOUND' |
    'INVALID_SECRET' |
    'NOT_ENOUGH_RIGHTS' |
    'ALREADY_EXIST';

export class ApiError extends Error {
    code: ApiErrorCode;
    status: number;

    constructor(code: ApiErrorCode, status: number, message: string = '') {
        super(message);
        this.code = code;
        this.status = status;
    }
}
