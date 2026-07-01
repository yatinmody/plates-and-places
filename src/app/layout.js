import "./globals.css";

export const metadata = {
  title: "Plates & Places",
  description: "A personal restaurant log — filter and sort places I've been to.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
