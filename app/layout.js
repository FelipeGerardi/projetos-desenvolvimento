import "./globals.css";

export const metadata = {
  title: "Projetos Desenvolvimento",
  description: "Landing de projetos + Login",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="text-black min-h-screen bg-neutral-100 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
