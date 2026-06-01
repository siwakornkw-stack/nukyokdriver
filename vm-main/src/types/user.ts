export interface UserResponse {
  success: boolean;
  code: number;
  message: string;
  data: User;
}

export interface User {
  CustomerId: string;
  TenantId: string;
  ImageUrl?: string;
  Name?: string;
  Username: string;
  MobileNo: string;
  LineId?: string;
  Email?: string;
}

export interface CheckLineResponse {
  success: boolean;
  code: number;
  message: string;
  data: CheckLine;
}

export interface CheckLine {
  hasLine: boolean;
  pid: string;
  lineImgUrl?: string | null;
}

export interface UserUpdate {
  Name: string;
  Email: string;
  MobileNo: string;
  ImageUrl: string;
  LineId?: string;
}

export type UploadImageUserDTO = {
  file: File[];
};

export type UploadImageUserResponse = {
  code: number;
  message: string;
  data: {
    url: string;
  };
}
