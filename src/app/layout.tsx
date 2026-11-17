import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ScreenNavigator } from "@/components/common/ScreenNavigator";

export const metadata: Metadata = {
  title: "FarmiQ - Smart Farming Assistant",
  description: "Mobile-first farming assistant for Indian farmers in Tamil, Telugu, and English.",
  applicationName: "FarmiQ",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FarmiQ",
  },
  icons: {
    icon: "/farmiq_plant_green.svg",
    apple: "/farmiq_plant_green.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2E7D32",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/farmiq_plant_green.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased min-h-screen flex justify-center bg-[#0d0f0d] text-[#E8EAE8]">
        <ThemeProvider>
          <LanguageProvider>
            <div className="w-full flex justify-center min-h-screen">
              {children}
            </div>
            <ScreenNavigator />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
