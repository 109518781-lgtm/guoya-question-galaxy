import type { Metadata } from "next";
import SubmitClient from "./submit-client";

export const metadata: Metadata = {
  title: "点亮一颗星",
};

export default function SubmitPage() {
  return <SubmitClient />;
}
