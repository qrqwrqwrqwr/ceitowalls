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
  title: "Ceito Walls",
  description: "Galería de live wallpapers",
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
