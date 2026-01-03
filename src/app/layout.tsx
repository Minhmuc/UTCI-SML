import type { Metadata } from "next";
import { Provider } from "@/components/Provider";
import "./globals.css";
import localFont from "next/font/local";

// Dùng font Minecraft.ttf từ thư mục public/fonts
const minecraft = localFont({
  src: "../../public/fonts/minecraft.ttf",
  variable: "--font-minecraft",
  display: "swap",
});

export const metadata: Metadata = {
  title: "🎮 UTCI SML - Hệ Thống Hỗ Trợ Điểm Sinh Viên",
  description: "LieMSdai - Hệ Thống Rất Con Người",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={minecraft.variable}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
