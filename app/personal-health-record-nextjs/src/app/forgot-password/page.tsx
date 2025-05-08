'use client';

import ForgotPassword from '@/components/ForgotPassword';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-teal-700">Personal Health Record</h1>
          <p className="mt-2 text-gray-600">Recover your account access</p>
        </div>
        <ForgotPassword />
      </div>
    </div>
  );
} 