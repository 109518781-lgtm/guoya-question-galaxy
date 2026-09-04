import type { Metadata } from "next";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "星光管理台",
};

export default function AdminPage() {
  return <AdminClient />;
}
