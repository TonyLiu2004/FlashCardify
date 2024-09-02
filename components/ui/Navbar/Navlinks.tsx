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
    <div className="relative flex flex-row justify-between py-4 align-center md:py-5" style={{
      width:"90vw",
    }}>
      <div className="flex items-center flex-1">
        <Link href="/" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
        <nav className="ml-6 space-x-4 lg:block" style={{fontSize:"17px"}} >
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
            </>
          )}
        </nav>
      </div>
      <div className="flex justify-end space-x-8">
        {user ? (
            <User />
        ) : (
          <Link href="/signin" className={s.link}>
            Sign In
          </Link>
        )}
      </div>
    </div>
  );
}
