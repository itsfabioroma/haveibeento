import type { Metadata } from 'next';
import config from '@/config';
import './globals.css';
import Script from 'next/script';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { Header } from '@/components/app/Header';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = config.metadata;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <SessionProvider>
                <Analytics />
                <body className='antialiased min-h-screen flex flex-col'>
                    <Toaster position='top-center' />
                    <div className='flex flex-col h-screen bg-[var(--background)]'>
                        <Header />
                        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-[var(--background)]'>{children}</main>
                    </div>
                </body>
                {/* Google Tag Manager - Optimized for Core Web Vitals */}
                {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
                    <Script
                        id='gtm'
                        strategy='lazyOnload'
                        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}`}
                    />
                )}
                {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
                    <Script
                        id='gtm-init'
                        strategy='lazyOnload'
                    >
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID}');
            `}
                    </Script>
                )}

                {/* OpenPanel Analytics - Optimized for Core Web Vitals */}
                {process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID && (
                    <Script
                        id='openpanel'
                        strategy='lazyOnload'
                        src='https://openpanel.dev/op.js'
                        data-client-id={process.env.NEXT_PUBLIC_OPENPANEL_CLIENT_ID}
                        data-track-screen-views='true'
                    />
                )}
            </SessionProvider>
        </html>
    );
}
