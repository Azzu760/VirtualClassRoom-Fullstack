import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

export interface UserData {
  name?: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
}

// Regular signup
export const signup = async (userData: UserData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/register`,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error("Signup error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || "Signup failed. Please try again."
    );
  }
};

// Regular login
export const login = async (
  userData: Omit<UserData, "name" | "role">
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/login`,
      userData
    );
    return response.data;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || "Login failed. Invalid email or password."
    );
  }
};

// Google OAuth
export const googleAuth = (): void => {
  try {
    const redirectUri = encodeURIComponent(
      "http://localhost:5000/api/auth/google/callback"
    );
    window.location.href = `${API_URL}/google?redirect_uri=${redirectUri}`;
  } catch (error: any) {
    console.error("Google OAuth error:", error.message);
    throw new Error("Failed to initiate Google login. Please try again.");
  }
};

// GitHub OAuth
export const githubAuth = (): void => {
  try {
    const redirectUri = encodeURIComponent(
      "http://localhost:5000/api/auth/github/callback"
    );
    window.location.href = `${API_URL}/github?redirect_uri=${redirectUri}`;
  } catch (error: any) {
    console.error("GitHub OAuth error:", error.message);
    throw new Error("Failed to initiate GitHub login. Please try again.");
  }
};

// Handle OAuth callback
export const handleOAuthCallback = async (
  code: string,
  provider: "google" | "github"
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/${provider}/callback`,
      { code }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "OAuth callback error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "OAuth callback failed. Please try again."
    );
  }
};
