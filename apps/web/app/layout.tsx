import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Prompt Media Queue",
  description: "Cross-platform prompt-driven media aggregation."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
