import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, TOKEN_KEY, USER_KEY } from "../api/client";
import type { PickedImage, User } from "../types";

interface AuthResponse {
  token: string;
  user: User;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(
    name: string,
    email: string,
    password: string,
    avatar: PickedImage | null
  ): Promise<void>;
  logout(): Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão salva no AsyncStorage ao abrir o app
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(USER_KEY);
      if (saved) setUser(JSON.parse(saved));
      setLoading(false);
    })();
  }, []);

  async function persist({ token, user }: AuthResponse) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }

  async function login(email: string, password: string) {
    const data = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    await persist(data);
  }

  async function register(
    name: string,
    email: string,
    password: string,
    avatar: PickedImage | null
  ) {
    const form = new FormData();
    form.append("name", name);
    form.append("email", email);
    form.append("password", password);
    if (avatar) form.append("avatar", avatar as unknown as Blob);
    const data = await api.postForm<AuthResponse>("/auth/register", form);
    await persist(data);
  }

  async function logout() {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
