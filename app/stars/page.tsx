import type { Metadata } from "next";
import StarsClient from "./stars-client";

export const metadata: Metadata = {
  title: "国雅问题星空",
};

export default function StarsPage() {
  return <StarsClient />;
}
