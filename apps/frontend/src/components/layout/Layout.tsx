import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DebugInfo } from "../debug/DebugInfo";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <Footer />
      <DebugInfo />
    </div>
  );
}
