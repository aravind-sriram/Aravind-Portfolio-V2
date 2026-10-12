import BracketFrame from "@/components/BracketFrame/BracketFrame";
import CornerBrackets from "@/components/CornerBrackets/CornerBrackets";
import CustomCursor from "@/components/CustomCursor/CustomCursor";
import GrainHush from "@/components/FilmGrain/GrainHush";
import "./globals.css";

export const metadata = {
  title: "Aravind Sriram",
  description: "Portfolio of Aravind Sriram",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <CornerBrackets variant="light" fixed />
        <BracketFrame>{children}</BracketFrame>
        <CustomCursor />
        <GrainHush />
      </body>
    </html>
  );
}
