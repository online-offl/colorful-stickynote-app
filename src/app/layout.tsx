'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { LOADING_DURATIONS } from '@/config/constants';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Show loading screen for configured duration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_DURATIONS.APP_LAUNCH);

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <body className={inter.className}>
        {isLoading ? (
          <LoadingScreen />
        ) : (
          children
        )}
      </body>
    </html>
  );
}
