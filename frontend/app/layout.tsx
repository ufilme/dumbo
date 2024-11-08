import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import './global.css'
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

export const metadata: Metadata = {
  title: "Dumbo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.className} antialiased`}>
      <body>
        <Theme>
          {children}
        </Theme>
      </body>
    </html>
  );
}