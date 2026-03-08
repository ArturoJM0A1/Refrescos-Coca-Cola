import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Venta de Refrescos",
  description: "Catalogo de refrescos Coca-Cola con precios actualizables"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
