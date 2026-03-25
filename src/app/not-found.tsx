import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-32 text-center">
      <p className="text-7xl font-bold text-indigo-100">404</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Siden finnes ikke</h1>
      <p className="mt-2 text-gray-500">Siden du leter etter eksisterer ikke eller er blitt flyttet.</p>
      <Link
        href="/"
        className="mt-8 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
      >
        Tilbake til forsiden
      </Link>
    </div>
  );
}
