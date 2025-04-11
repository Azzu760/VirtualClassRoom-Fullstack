import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useContext,
} from "react";
import axios from "axios";
import {
  signup as authSignup,
  login as authLogin,
  googleAuth,
  githubAuth,
} from "../services/authService";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  handleGoogleAuth: () => Promise<void>;
  handleGitHubAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data on initial load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = sessionStorage.getItem("token"); // Use sessionStorage
        if (token) {
          const res = await axios.get("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(res.data);
        }
      } catch (error) {
        console.error("User fetch error:", error);
        setError("Failed to fetch user data. Please log in again.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await authLogin({ email, password });

      if (!res.user || !res.token) {
        throw new Error("Invalid response from server");
      }

      // Use localStorage instead of sessionStorage
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setUser(res.user);
      setError(null);

      return { success: true, user: res.user };
    } catch (error: any) {
      console.error("Login error:", error.message);
      setError(error.message || "Login failed. Please check your credentials.");
      return { success: false, message: error.message || "Login failed" };
    }
  }, []);

  // Signup function
  const signup = useCallback(
    async (name: string, email: string, password: string, role: string) => {
      try {
        const res = await authSignup({ name, email, password, role });
        localStorage.setItem("token", res.token);
        setUser(res.user);
        setError(null);
        return { success: true };
      } catch (error: any) {
        console.error("Signup error:", error.message);
        setError(error.message || "Signup failed. Please try again.");
        return { success: false, message: error.message || "Signup failed" };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  // Google OAuth handler
  const handleGoogleAuth = useCallback(async () => {
    try {
      await googleAuth();
      setError(null);
    } catch (error: any) {
      console.error("Google OAuth error:", error.message);
      setError(
        error.message || "Google authentication failed. Please try again."
      );
    }
  }, []);

  // GitHub OAuth handler
  const handleGitHubAuth = useCallback(async () => {
    try {
      await githubAuth();
      setError(null);
    } catch (error: any) {
      console.error("GitHub OAuth error:", error.message);
      setError(
        error.message || "GitHub authentication failed. Please try again."
      );
    }
  }, []);

  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    handleGoogleAuth,
    handleGitHubAuth,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
