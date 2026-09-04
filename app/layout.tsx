import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "国雅问题星空",
    template: "%s | 国雅问题星空",
  },
  description: "把一个人的问题，变成一颗值得被看见的星。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
