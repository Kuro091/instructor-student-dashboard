export enum Role {
  INSTRUCTOR = "INSTRUCTOR",
  STUDENT = "STUDENT",
}

export type AuthUser = {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: Role;
};

export interface CreateAccessCodeRequest {
  phoneNumber: string;
}

export interface ValidateAccessCodeRequest {
  phoneNumber: string;
  accessCode: string;
}

export interface LoginEmailRequest {
  email: string;
}

export interface ValidateEmailCodeRequest {
  email: string;
  accessCode: string;
}
