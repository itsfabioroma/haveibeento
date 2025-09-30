'use client';

import { Menu, X } from 'lucide-react';
import UserMenu from '@/components/user/UserMenu';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
                            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
                        >
                            Sign In
                        </button>
                    )}
                    <button
                        className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md'
                        aria-label='Open menu'
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className='md:hidden mt-4 py-2 border-t border-gray-200'>
                    <nav className='flex flex-col space-y-2'>
                        <div className='px-4 py-2 text-gray-500'>
                            {isAuthenticated ? (
                                <UserMenu />
                            ) : (
                                <button
                                    onClick={() => (window.location.href = '/api/auth/signin')}
                                    className='inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
                                >
                                    Signup / Login
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
