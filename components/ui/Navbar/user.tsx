import { useState, useEffect } from 'react';
import { Button } from './button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { handleRequest } from '@/utils/auth-helpers/client';
import { SignOut } from '@/utils/auth-helpers/server';

export function User() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error: unknown) {
        console.error('Error fetching user details:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  function handleMouseClick(
    event: React.MouseEvent,
    callback: (formData: FormData) => void,
    router: any
  ) {
    event.preventDefault();
    const formData = new FormData();
    callback(formData);
    router.push('/');
  }


  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
        >
          <Image
            src={user?.user_metadata.avatar_url ?? '/avatar.png'}
            width={100}
            height={100}
            alt="Avatar"
            className="overflow-hidden rounded-full mt-10"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className='bg-black'>
        {user && (
          <DropdownMenuLabel>{user.user_metadata.full_name}</DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <Link href="/account">
          <Link href="/home">
            <DropdownMenuItem>
              Profile
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            Account
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem disabled>Support</DropdownMenuItem>
        <Link href="/challenge/history">
          <DropdownMenuItem>
            History
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem onClick={(e) => handleMouseClick(e, SignOut, router)}>
            Sign Out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem>
            <Link href="/signin">Sign In</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
