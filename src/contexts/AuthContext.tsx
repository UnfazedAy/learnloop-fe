import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "@/lib/axios";
import { Gender } from "@/types/index";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: Gender;
  image?: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: { id: string; email: string; emailConfirmed: boolean };
}

interface TokenPayload {
  exp: number;
}


interface LoginResponse {
  success: boolean;
  message: string;
  data: { accessToken: string };
}

interface ProfileResponse {
  success: boolean;
  message: string;
  data: User;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (newUser: Omit<User, "id"> & { password: string }) => Promise<any>;
  completeRegistration: (accessToken: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const isTokenExpired = (token: string | null) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    const now = Date.now() / 1000;

    return decoded.exp < now;
  } catch {
    return true;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user from localStorage (runs on mount + on any auth change)
  const syncUser = () => {
    try {
      const token = localStorage.getItem("learnloop_token");
      if (!token || isTokenExpired(token)) {
        localStorage.removeItem("learnloop_token");
        localStorage.removeItem("learnloop_user");
        setUser(null);
        return;
      }

      const storedUser = localStorage.getItem("learnloop_user");
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    syncUser();
    setLoading(false);

    const handler = () => syncUser();
    window.addEventListener("storage", handler);
    window.addEventListener("auth-change", handler);

    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("auth-change", handler);
    };
  }, []);

  const dispatchAuthChange = () => {
    window.dispatchEvent(new Event("auth-change"));
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const loginRes = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { accessToken } = loginRes.data.data;

      localStorage.setItem("learnloop_token", accessToken);

      const profileRes = await api.get<ProfileResponse>("/user/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = profileRes.data.data;
      localStorage.setItem("learnloop_user", JSON.stringify(profile));
      setUser(profile);
      dispatchAuthChange();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (newUser: Omit<User, "id"> & { password: string }) => {
    setError(null);
    try {
      const res = await api.post<RegisterResponse>("/auth/sign-up", {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        gender: newUser.gender.toLowerCase(),
      });
      return res.data;
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
      throw new Error(msg);
    }
  };

  const completeRegistration = async (accessToken: string) => {
    setError(null);
    try {
      const res = await api.post<ProfileResponse>(
        "/auth/complete-profile",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const profile = res.data.data;
      localStorage.setItem("learnloop_token", accessToken);
      localStorage.setItem("learnloop_user", JSON.stringify(profile));
      setUser(profile);
      dispatchAuthChange();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to complete registration";
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem("learnloop_user");
    localStorage.removeItem("learnloop_token");
    setUser(null);
    dispatchAuthChange();
  };

  const getToken = () => localStorage.getItem("learnloop_token");

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        completeRegistration,
        logout,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
