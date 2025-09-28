import { User } from "../../generated/prisma";

export type AuthUser = Pick<User, "id" | "phone" | "email" | "name" | "role">;

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
