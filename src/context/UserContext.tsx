"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  district?: string;
  language?: string;
  theme?: string;
  isLoggedIn?: boolean;
}

interface UserContextType {
  user: UserProfile;
  isLoading: boolean;
  setUserName: (name: string) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const defaultUser: UserProfile = {
  name: "Murugan",
  phone: "98765 43210",
  district: "Madurai",
  isLoggedIn: false,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  isLoading: true,
  setUserName: () => {},
  setUserProfile: () => {},
  refreshUser: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone,
            district: data.user.district,
            language: data.user.language,
            theme: data.user.theme,
            isLoggedIn: true,
          });
          localStorage.setItem("farmiq_user_name", data.user.name);
          localStorage.setItem("farmiq_user_phone", data.user.phone);
          if (data.user.district) localStorage.setItem("farmiq_user_district", data.user.district);
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    // Fallback to localStorage if offline
    const savedName = localStorage.getItem("farmiq_user_name");
    const savedPhone = localStorage.getItem("farmiq_user_phone");
    const savedDistrict = localStorage.getItem("farmiq_user_district");

    setUser({
      name: savedName || defaultUser.name,
      phone: savedPhone || defaultUser.phone,
      district: savedDistrict || defaultUser.district,
      isLoggedIn: Boolean(savedName),
    });
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const setUserName = (name: string) => {
    setUser((prev) => ({ ...prev, name }));
    localStorage.setItem("farmiq_user_name", name);
  };

  const setUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...profile };
      if (profile.name) localStorage.setItem("farmiq_user_name", profile.name);
      if (profile.phone) localStorage.setItem("farmiq_user_phone", profile.phone);
      if (profile.district) localStorage.setItem("farmiq_user_district", profile.district);
      return updated;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        setUserName,
        setUserProfile,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
