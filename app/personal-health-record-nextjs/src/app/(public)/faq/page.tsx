'use client';

import React from 'react';
import FAQPage from '@/components/FAQPage';
import { usePathname } from 'next/navigation';

export default function FAQ() {
  const pathname = usePathname();
  console.log('Rendering FAQ page at path:', pathname);
  
  return <FAQPage />;
}