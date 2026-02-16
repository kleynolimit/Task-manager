'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,hsl(210,85%,45%)_0%,hsl(210,85%,60%)_100%)] flex items-center justify-center p-6">
      <div className="text-center space-y-8">
        <h1 className="text-white text-[56px] font-extrabold leading-tight">Clear Tasks</h1>
        <p className="text-white/70 text-2xl font-semibold">Simplicity meets productivity</p>
        
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-white text-gray-900 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
