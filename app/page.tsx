import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to EduX SaaS</h1>
      <p className="text-xl mb-8">A multi-tenant platform for education management</p>
      <div className="space-x-4">
        <Link href="/login">
          <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">Login</button>
        </Link>
        <Link href="/signup">
          <button className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">Signup</button>
        </Link>
      </div>
    </div>
  );
}