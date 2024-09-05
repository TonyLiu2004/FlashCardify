'use client';

import Link from 'next/link';
import { SignOut } from '@/utils/auth-helpers/server';
import { handleRequest } from '@/utils/auth-helpers/client';
import Logo from '@/components/icons/Logo';
import { usePathname, useRouter } from 'next/navigation';
import { getRedirectMethod } from '@/utils/auth-helpers/settings';
import { User } from './user';
import s from './Navbar.module.css';

interface NavlinksProps {
  user?: any;
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === 'client' ? useRouter() : null;

  return (
    <div className="flex items-center justify-between py-2 px-4 h-20" style={{ width: "90vw" }}>
      <div className="flex items-center">
        <Link href="/" className={s.logo} aria-label="Logo">
          <img src="/alt_logo.png" className="h-14 w-auto" alt="FlashCardify Logo" />
        </Link>
        <nav className="ml-6 space-x-4 lg:block" style={{ fontSize: "17px" }}>
          {user && (
            <>
              <Link href="/" className={s.link}>
                Home
              </Link>
              <Link href="/generate" className={s.link}>
                Generate
              </Link>
              <Link href="/decks" className={s.link}>
                My Decks
              </Link>
              <Link href="/challenge" className={s.link}>
                Challenge
              </Link>
              <Link href="/shared" className={s.link}>
                Public
              </Link>
              <Link href="/upload" className={s.link}>
                Upload
              </Link>
            </>
          )}
        </nav>
      </div>
      <div className="flex items-center justify-center">
        {user ? (
          <User />
        ) : (
          <Link
            href="/signin"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors duration-200"
          >
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}