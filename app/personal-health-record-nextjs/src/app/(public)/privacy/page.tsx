'use client';

import React from 'react';
import PrivacyPolicyPage from '@/components/PrivacyPolicyPage';
import { usePathname } from 'next/navigation';

export default function Privacy() {
  const pathname = usePathname();
  console.log('Rendering Privacy page at path:', pathname);
  
  return <PrivacyPolicyPage />;
}