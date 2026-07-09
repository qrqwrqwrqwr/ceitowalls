"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

type ToastState = { id: number; message: string } | null;

type AppContextValue = {
  profile: Profile | null;
  loading: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (v: boolean) => void;
  toast: ToastState;
  showToast: (message: string) => void;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 2600);
  }, []);

  const refreshProfile = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, username, photo_url, is_admin")
      .eq("id", user.id)
      .single();
    setProfile(data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshProfile();
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshProfile();
    });
    return () => sub.subscription.unsubscribe();
  }, [refreshProfile]);

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        profile,
        loading,
        authModalOpen,
        setAuthModalOpen,
        toast,
        showToast,
        refreshProfile,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
