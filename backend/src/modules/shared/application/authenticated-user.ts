export interface AuthenticatedUser {
  id: string;
  planId: string;
  name: string;
  email: string;
  isVerified?: boolean;
}
