'use client';

import { signIn } from 'next-auth/react';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center p-6">
      <div className="text-center space-y-8">
        <h1 className="text-white text-5xl font-bold">Task Manager</h1>
        <p className="text-white/80 text-xl">Clear-style todo app</p>
        
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-white text-gray-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
