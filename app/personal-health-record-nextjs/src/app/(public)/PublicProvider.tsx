'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function PublicProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  console.log('Public route accessed:', pathname);
  
  return <>{children}</>;
} 