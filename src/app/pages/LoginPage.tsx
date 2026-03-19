import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Building2, Eye, EyeOff, Home, User, LogIn, AlertCircle } from 'lucide-react';
import { loginUser, setCurrentSession } from '../data/auth';
import { toast } from 'sonner';

export function LoginPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = loginUser(email.trim(), password, role);
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }
      setCurrentSession(result.user!);
      toast.success(`Welcome back, ${result.user!.name}!`);
      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/tenant/dashboard');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 flex flex-col">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-orange-700/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl text-white" style={{ fontWeight: 700 }}>Rent Easy</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Title */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <LogIn className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                Sign In to Rent Easy
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Use your registered account to continue
              </p>
            </div>

            {/* Role Selector */}
            <div className="flex bg-orange-50 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => { setRole('tenant'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
                  role === 'tenant'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
                style={{ fontWeight: 600 }}
              >
                <Home className="w-4 h-4" /> I'm a Tenant
              </button>
              <button
                type="button"
                onClick={() => { setRole('owner'); setErrorMsg(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-all ${
                  role === 'owner'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
                style={{ fontWeight: 600 }}
              >
                <User className="w-4 h-4" /> I'm an Owner
              </button>
            </div>

            {/* Error */}
            {errorMsg && (
              <div className="mb-5 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{errorMsg}</p>
                  {errorMsg.includes('create an account') && (
                    <Link to="/register" className="underline mt-1 block text-orange-600" style={{ fontWeight: 600 }}>
                      → Create an account here
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-gray-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                style={{ fontWeight: 700 }}
              >
                {loading ? 'Signing in...' : `Sign In as ${role === 'owner' ? 'Owner' : 'Tenant'}`}
              </button>
            </form>

            <p className="text-center mt-6 text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-orange-600 hover:text-orange-700 underline" style={{ fontWeight: 600 }}>
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 text-center py-5 text-white/70 text-sm">
        Secure & trusted by thousands of users in Hyderabad
      </div>
    </div>
  );
}
