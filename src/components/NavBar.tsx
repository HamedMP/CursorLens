'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-full transition-colors duration-200 ${
        active
          ? 'bg-primary-foreground text-primary font-semibold'
          : 'text-primary-foreground hover:bg-primary-foreground/10'
      }`}
    >
      {children}
    </Link>
  );
}

export default function NavBar() {
  return (
    <nav className='flex items-center justify-center'>
      <div className='flex items-center space-x-6'>
        <NavLink href='/'>Home</NavLink>
        <NavLink href='/logs'>Logs</NavLink>
        <NavLink href='/configurations'>Configurations</NavLink>
        <NavLink href='/stats'>Stats</NavLink>
        <ThemeToggle />
      </div>
    </nav>
  );
}
