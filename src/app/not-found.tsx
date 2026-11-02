import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-black text-red-600 mb-2">404</h1>
      <h2 className="text-xl font-bold uppercase tracking-wide mb-4">Page Not Found</h2>
      <p className="text-gray-400 text-sm mb-6 max-w-sm">
        The tournament page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl transition"
      >
        Return to Tournament Home
      </Link>
    </div>
  );
}
