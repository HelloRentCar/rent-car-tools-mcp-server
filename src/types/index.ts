/**  前端处理过的response */
export interface WrappedResult<D> {
    error: Error | null
    /** 请求返回 result.data */
    data: D | null
    /** 请求返回 result */
    result: ResponseResult<Result<D>> | null
    /** 错误信息 */
    message: string
    /** 返回状态码 */
    code?: number
    /** 链路异常追踪的完整响应数据 */
    response?: D | null
}

/** 网关层response */
export interface ResponseResult<D = Result<unknown>> {
    code: number
    msg: string
    data: D
}

/** 业务层response */
export interface Result<D = unknown> {
    data: D
    bizMsg: string // "success"
    bizCode: number // 0
}