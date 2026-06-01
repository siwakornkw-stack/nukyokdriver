export interface ApiResponse<T = void> {
    message: string
    data?: T
    error?: any
    success?: boolean
  }