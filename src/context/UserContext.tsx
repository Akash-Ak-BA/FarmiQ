"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfile {
  name: string;
  phone: string;
  district?: string;
}

interface UserContextType {
  user: UserProfile;
  setUserName: (name: string) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
}

const defaultUser: UserProfile = {
  name: "Murugan",
  phone: "98765 43210",
  district: "Madurai",
};

const UserContext = createContext<UserContextType>({
  user: defaultUser,
  setUserName: () => {},
  setUserProfile: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const savedName = localStorage.getItem("farmiq_user_name");
    const savedPhone = localStorage.getItem("farmiq_user_phone");
    const savedDistrict = localStorage.getItem("farmiq_user_district");

    if (savedName || savedPhone) {
      setUser({
        name: savedName || defaultUser.name,
        phone: savedPhone || defaultUser.phone,
        district: savedDistrict || defaultUser.district,
      });
    }
  }, []);

  const setUserName = (name: string) => {
    const updated = { ...user, name };
    setUser(updated);
    localStorage.setItem("farmiq_user_name", name);
  };

  const setUserProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...user, ...profile };
    setUser(updated);
    if (profile.name) localStorage.setItem("farmiq_user_name", profile.name);
    if (profile.phone) localStorage.setItem("farmiq_user_phone", profile.phone);
    if (profile.district) localStorage.setItem("farmiq_user_district", profile.district);
  };

  return (
    <UserContext.Provider value={{ user, setUserName, setUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
