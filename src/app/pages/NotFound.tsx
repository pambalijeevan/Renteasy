import { Link } from "react-router";
import { Building2, Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Home className="w-10 h-10 text-orange-500" />
        </div>
        <h1 className="text-6xl text-orange-600 mb-3" style={{ fontWeight: 800 }}>404</h1>
        <p className="text-gray-700 text-xl mb-2" style={{ fontWeight: 700 }}>Page Not Found</p>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-md"
          style={{ fontWeight: 600 }}
        >
          <Building2 className="w-4 h-4" />
          Go to Rent Easy Home
        </Link>
      </div>
    </div>
  );
}