import React, { createContext, useContext, useState, useEffect } from "react";
import type { User, Permission, UserRole } from "../../types";
import { AuthService } from "../../services/auth.service";
import { ROLE_PERMISSIONS } from "../../constants/permissions";
import { PlatformReachService } from "../../services/platform-reach.service";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, passwordHash: string) => Promise<User>;
  register: (name: string, email: string, passwordHash: string) => Promise<User>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await AuthService.getCurrentUserAsync();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await AuthService.login(email, passwordHash);
      setUser(loggedUser);
      PlatformReachService.recordUserLogin(loggedUser);
      announceToScreenReader(`Signed in successfully as ${loggedUser.name}`);
      return loggedUser;
    } catch (error) {
      announceToScreenReader("Sign in failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      const newUser = await AuthService.register(name, email, passwordHash);
      setUser(newUser);
      announceToScreenReader(`Registered and signed in successfully as ${newUser.name}`);
      return newUser;
    } catch (error) {
      announceToScreenReader("Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      announceToScreenReader("Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  // Accessibility screen reader announcement
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "assertive");
    announcement.setAttribute("aria-atomic", "true");
    announcement.classList.add("sr-only");
    document.body.appendChild(announcement);
    setTimeout(() => {
      announcement.textContent = message;
    }, 50);
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        hasPermission,
        hasRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
