export interface UserDto {
  id: string;
  name: string;
  email: string;
  planId: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
