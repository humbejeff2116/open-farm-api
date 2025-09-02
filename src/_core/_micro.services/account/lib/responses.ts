
export interface JSONErrorResponse {
    status: number,
    error: boolean,
    message: string,
}

export interface ResponseJSON {
    status: number,
    userExist?: boolean,
    token?: string,
    error: boolean,
    message: string,
    success?: boolean
    data?: object,
}