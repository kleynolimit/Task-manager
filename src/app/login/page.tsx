'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(0,85%,50%)_0%,hsl(28,90%,56%)_100%)] flex items-center justify-center p-6 pt-[calc(1.5rem+env(safe-area-inset-top))]">
      <div className="text-center space-y-8 max-w-md">
        <h1 className="text-white text-[64px] font-extrabold leading-tight">Tasks</h1>
        <p className="text-white/90 text-2xl font-bold">Stay focused. Get it done.</p>

        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-white text-gray-900 px-10 py-5 rounded-3xl text-2xl font-bold hover:bg-gray-100 transition-colors shadow-2xl"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
