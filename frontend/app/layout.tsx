import "./globals.css";
import Link from "next/link";
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-ink/10 bg-[#f7f4ee]/90">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Support Desk
            </Link>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
