"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSessionStore } from "@/lib/store";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  avatarColor?: string;
  savedProjects?: Array<{
    id: string;
    goal: string;
    templateId: string;
    masteryScore: number;
    totalConcepts: number;
    masteredConcepts: number;
    currentConceptId?: string;
    activeStage?: string;
    screen?: string;
    sessionData?: any;
    lastUpdated: string;
  }>;
  pythonMasteredModules?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  syncProgress: (payload: { pythonMasteredModules?: string[]; currentProject?: any }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  loginAsGuest: () => {},
  logout: async () => {},
  syncProgress: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          // If previously stored guest session, clear it now that main account is authenticated
          if (typeof window !== "undefined") {
            localStorage.removeItem("socrates_guest_user");
          }
          return;
        }
      }

      // If server has no authenticated session, check if user logged in as Guest
      if (typeof window !== "undefined") {
        const guestData = localStorage.getItem("socrates_guest_user");
        if (guestData) {
          try {
            const parsed = JSON.parse(guestData);
            setUser(parsed);
            return;
          } catch {
            localStorage.removeItem("socrates_guest_user");
          }
        }
      }

      setUser(null);
    } catch {
      if (typeof window !== "undefined") {
        const guestData = localStorage.getItem("socrates_guest_user");
        if (guestData) {
          try {
            setUser(JSON.parse(guestData));
            return;
          } catch {}
        }
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loginAsGuest = useCallback(() => {
    let guestUser: AuthUser;
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("socrates_guest_user");
      if (existing) {
        try {
          guestUser = JSON.parse(existing);
        } catch {
          guestUser = {
            id: "guest_" + Math.random().toString(36).substring(2, 9),
            name: "Guest Learner",
            email: "guest@socrates.local",
            isGuest: true,
            avatarColor: "#10B981",
            pythonMasteredModules: [],
            savedProjects: [],
          };
        }
      } else {
        guestUser = {
          id: "guest_" + Math.random().toString(36).substring(2, 9),
          name: "Guest Learner",
          email: "guest@socrates.local",
          isGuest: true,
          avatarColor: "#10B981",
          pythonMasteredModules: [],
          savedProjects: [],
        };
      }
      localStorage.setItem("socrates_guest_user", JSON.stringify(guestUser));
    } else {
      guestUser = {
        id: "guest_" + Math.random().toString(36).substring(2, 9),
        name: "Guest Learner",
        email: "guest@socrates.local",
        isGuest: true,
        avatarColor: "#10B981",
        pythonMasteredModules: [],
        savedProjects: [],
      };
    }
    setUser(guestUser);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Rehydrate user's saved Python modules and projects into local store on login
  useEffect(() => {
    if (!user) return;

    const store = useSessionStore.getState();
    if (user.pythonMasteredModules && user.pythonMasteredModules.length > 0) {
      const merged = Array.from(
        new Set([...(store.pythonMasteredModules || []), ...user.pythonMasteredModules])
      );
      useSessionStore.setState({ pythonMasteredModules: merged });
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("socrates_guest_user");
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("socrates_guest_user");
      }
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Suppress network errors during logout
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("socrates_guest_user");
      }
      setUser(null);
    }
  };

  const syncProgress = useCallback(
    async (payload: { pythonMasteredModules?: string[]; currentProject?: any }) => {
      if (!user) return;

      // Handle guest user local persistence
      if (user.isGuest) {
        setUser((prev) => {
          if (!prev) return null;
          const updated: AuthUser = {
            ...prev,
            pythonMasteredModules: payload.pythonMasteredModules || prev.pythonMasteredModules,
          };
          if (payload.currentProject) {
            const projects = prev.savedProjects ? [...prev.savedProjects] : [];
            const idx = projects.findIndex((p) => p.id === payload.currentProject.id || p.goal === payload.currentProject.goal);
            const projEntry = {
              ...payload.currentProject,
              lastUpdated: new Date().toISOString(),
            };
            if (idx >= 0) {
              projects[idx] = { ...projects[idx], ...projEntry };
            } else {
              projects.unshift(projEntry);
            }
            updated.savedProjects = projects;
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("socrates_guest_user", JSON.stringify(updated));
          }
          return updated;
        });
        return;
      }

      try {
        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser((prev) => (prev ? { ...prev, ...data.user } : null));
          }
        }
      } catch {
        // Background sync, suppress network errors
      }
    },
    [user]
  );

  // Subscribe to session store to automatically sync learner progress to MongoDB
  useEffect(() => {
    if (!user) return;

    const unsubscribe = useSessionStore.subscribe((state) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        const totalConcepts = state.concepts?.length || 0;
        const masteredConcepts = Object.values(state.mastery || {}).filter(
          (m: any) => m?.status === "mastered"
        ).length;

        const currentProject = state.goal
          ? {
              id: state.id || "default-session",
              goal: state.goal,
              templateId: state.templateId || "custom",
              masteryScore: totalConcepts > 0 ? Math.round((masteredConcepts / totalConcepts) * 100) : 0,
              totalConcepts,
              masteredConcepts,
              currentConceptId: state.currentConceptId,
              activeStage: state.activeStage,
              screen: state.screen,
            }
          : undefined;

        syncProgress({
          pythonMasteredModules: state.pythonMasteredModules,
          currentProject,
        });
      }, 1500);
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, syncProgress]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginAsGuest,
        logout,
        syncProgress,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
