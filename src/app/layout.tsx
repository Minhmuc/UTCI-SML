import type { Metadata } from "next";
import { Provider } from "@/components/Provider";
import "./globals.css";

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
    <html lang="vi">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
