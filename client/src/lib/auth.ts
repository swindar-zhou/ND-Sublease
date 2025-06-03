import { apiRequest } from "./queryClient";

interface User {
  id: number;
  email: string;
  name: string;
  uid: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  if (!email.endsWith("@nd.edu")) {
    throw new Error("Only Notre Dame email addresses are allowed");
  }
  
  const response = await apiRequest("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  
  return response;
};

export const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  if (!email.endsWith("@nd.edu")) {
    throw new Error("Only Notre Dame email addresses are allowed");
  }
  
  const response = await apiRequest("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
  
  return response;
};

export const signOut = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");
  window.location.reload();
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("current_user");
  return userStr ? JSON.parse(userStr) : null;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const isNDStudent = (user: User | null): boolean => {
  return user?.email?.endsWith("@nd.edu") ?? false;
};
