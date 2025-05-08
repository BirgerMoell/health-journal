import { Inter } from 'next/font/google';
import '../globals.css';
import PublicProvider from './PublicProvider';

const inter = Inter({ subsets: ['latin'] });

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicProvider>
      <div className={inter.className}>
        <header className="bg-teal-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">Health Record AI</h1>
            <div className="space-x-4">
              <a href="/" className="hover:underline">Home</a>
              <a href="/login" className="hover:underline">Login</a>
              <a href="/faq" className="hover:underline">FAQ</a>
              <a href="/privacy" className="hover:underline">Privacy</a>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-6 px-4">{children}</main>
        <footer className="bg-gray-100 p-4 mt-8">
          <div className="container mx-auto text-center text-gray-600">
            <p>© {new Date().getFullYear()} Health Record AI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </PublicProvider>
  );
} 