import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { Toast } from "@/components/Toast";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ceitowalls.vercel.app"),
  title: {
    default: "Ceito Walls — Live Wallpapers, Banners e Iconos",
    template: "%s | Ceito Walls",
  },
  description:
    "Ceito Walls es una galería gratuita de live wallpapers, banners e iconos para Discord y PC. Descargá wallpapers animados de Anime, Fantasy, Vehículos, Juegos y más.",
  keywords: ["ceito walls", "ceitowalls", "live wallpapers", "wallpapers animados", "banners discord", "iconos discord"],
  openGraph: {
    title: "Ceito Walls — Live Wallpapers, Banners e Iconos",
    description: "Galería gratuita de live wallpapers, banners e iconos animados para Discord y PC.",
    url: "https://ceitowalls.vercel.app",
    siteName: "Ceito Walls",
    locale: "es_ES",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "DIXlDx36gu3YwdCeP0u3uwNh97JRSXLLQCWyW7Yj40g",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${poppins.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-black font-sans" style={{ fontFamily: "var(--font-poppins), sans-serif" }}>
        <AppProvider>
          {children}
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
