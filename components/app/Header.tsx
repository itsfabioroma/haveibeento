'use client';

import UserMenu from '@/components/user/UserMenu';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export function Header() {
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    return (
        <header className='bg-white shadow-md py-4 px-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                    <Link href='/'>
                        <h1 className='text-xl font-semibold flex items-center gap-2'>🌍 Have I Been To...</h1>
                    </Link>
                </div>
                <div className='flex items-center gap-4'>
                    {isAuthenticated ? (
                        <UserMenu />
                    ) : (
                        <button
                            onClick={() => (window.location.href = '/api/auth/signin')}
                            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200'
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
