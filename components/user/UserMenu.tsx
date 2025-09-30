'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'lucide-react';

export default function UserMenu() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();
    const user = session?.user;
    const menuRef = useRef<HTMLDivElement>(null);

    const handleSignOut = () => {
        signOut();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    if (!user) return null;

    return (
        <div
            className='relative'
            ref={menuRef}
        >
            <button
                className='flex items-center space-x-3 focus:outline-none'
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <img
                    src={user.image || 'https://www.gravatar.com/avatar/?d=mp'}
                    alt={`${user.name || 'User'} avatar`}
                    className='h-8 w-8 rounded-full object-cover'
                />
                <span className='hidden md:flex items-center space-x-1'>
                    <span className='text-sm font-medium text-gray-700'>{user.name || user.email}</span>
                    <ChevronDown className='h-4 w-4 text-gray-500' />
                </span>
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
                <div className='absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50'>
                    <div
                        className='py-1'
                        role='menu'
                        aria-orientation='vertical'
                        aria-labelledby='user-menu'
                    >
                        <a
                            href='/profile'
                            className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            role='menuitem'
                        >
                            <User className='mr-3 h-4 w-4' />
                            My Profile
                        </a>

                        <button
                            onClick={handleSignOut}
                            className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                            role='menuitem'
                        >
                            <LogOut className='mr-3 h-4 w-4' />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
