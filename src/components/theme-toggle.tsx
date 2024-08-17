'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className='p-2 rounded-full hover:bg-primary-foreground/10 relative'
    >
      <Sun className='h-5 w-5 transition-all dark:absolute dark:opacity-0' />
      <Moon className='h-5 w-5 absolute transition-all opacity-0 dark:opacity-100 dark:static' />
      <span className='sr-only'>Toggle theme</span>
    </button>
  );
}
