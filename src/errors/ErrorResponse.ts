import { ErrorCode } from "./ErrorCode"

export interface ErrorResponse<T> {
    status: number,
    code: ErrorCode,
    message: string,
    timestamp: Date,
    trackingId: string,
    data: T,
}