import { oliveira, dmSans } from "@/app/fonts";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppProviders } from "@/app/contexts";

export default function BetaLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${oliveira.variable} ${dmSans.variable} font-dm-sans`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <AppProviders>{children}</AppProviders>
      </ThemeProvider>
    </div>
  );
}