import localFont from "next/font/local";
import { DM_Sans } from "next/font/google";

export const oliveira = localFont({
  src: "../public/fonts/oliveira.ttf",
  variable: "--font-oliveira",
  display: "swap",
});

export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});