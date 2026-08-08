// Core User Object matching your login response
export interface User {
  id: number;
  name: string;
  email: string;
  Is2faenabled: boolean; 
  role: string;
  Createdat: string;
  UpdatedAt: string;
  Twosecret: string;
}

// Create User Payload (Request)
export interface CreateUserPayload {
  name: string;
  email: string;
  password:  string;
  Is2faEnabled: boolean; // Notice capital E from your request payload
  role: string;
}

// Generic Base Response
export interface BaseApiResponse {
  is_success?: boolean;
  message: string;
}

// Login Data Container
export interface LoginData {
  access_token: string;
  refresh_token: string;
  user: User;
}

// Login Response (Response)
export interface LoginResponse {
  data: LoginData;
  message: string;
}

// 2FA Verification Payload (Assuming structure based on standard setups)
export interface Verify2FAPayload {
  email: string;
  code: string; 
}