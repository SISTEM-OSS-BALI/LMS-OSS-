import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import DndWrapper from "./lib/utils/dndWrapper";
import AuthWrapper from "./lib/auth/authWrapper";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "react-quill/dist/quill.snow.css";

export const metadata: Metadata = {
  title: "LMS OSS",
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthWrapper>
          <AntdRegistry>
            <DndWrapper>{children}</DndWrapper>
          </AntdRegistry>
        </AuthWrapper>
      </body>
    </html>
  );
}
