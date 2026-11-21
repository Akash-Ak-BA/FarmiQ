"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  district?: string;
  avatar?: string;
  language?: string;
  theme?: string;
  isLoggedIn?: boolean;
}

interface UserContextType {
  user: UserProfile;
  isLoading: boolean;
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const defaultUser: UserProfile = {
  name: "Murugan",
  phone: "98765 43210",
  district: "Madurai",
  avatar: "",
  isLoggedIn: false,
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  isLoading: true,
  setUserName: () => {},
  setUserAvatar: () => {},
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
          const savedAvatar = localStorage.getItem("farmiq_user_avatar") || "";
          setUser({
            id: data.user.id,
            name: data.user.name,
            phone: data.user.phone,
            district: data.user.district,
            avatar: savedAvatar,
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

    const savedName = localStorage.getItem("farmiq_user_name");
    const savedPhone = localStorage.getItem("farmiq_user_phone");
    const savedDistrict = localStorage.getItem("farmiq_user_district");
    const savedAvatar = localStorage.getItem("farmiq_user_avatar") || "";

    setUser({
      name: savedName || defaultUser.name,
      phone: savedPhone || defaultUser.phone,
      district: savedDistrict || defaultUser.district,
      avatar: savedAvatar,
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

  const setUserAvatar = (avatar: string) => {
    setUser((prev) => ({ ...prev, avatar }));
    localStorage.setItem("farmiq_user_avatar", avatar);
  };

  const setUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...profile };
      if (profile.name) localStorage.setItem("farmiq_user_name", profile.name);
      if (profile.phone) localStorage.setItem("farmiq_user_phone", profile.phone);
      if (profile.district) localStorage.setItem("farmiq_user_district", profile.district);
      if (profile.avatar !== undefined) localStorage.setItem("farmiq_user_avatar", profile.avatar);
      return updated;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        setUserName,
        setUserAvatar,
        setUserProfile,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
