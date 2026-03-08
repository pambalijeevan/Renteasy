import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Building2, Eye, EyeOff, Home, User, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerUser } from '../data/auth';
import { toast } from 'sonner';

export function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    if (!/^\+?[0-9\s\-]{10,14}$/.test(phone.trim())) {
      setErrorMsg('Please enter a valid phone number (10-14 digits).');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        role,
      });
      setLoading(false);
      if (!result.success) {
        setErrorMsg(result.message);
        return;
      }
      toast.success('Account created! Please sign in to continue.');
      navigate('/login');
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
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            {/* Title */}
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl text-gray-900" style={{ fontWeight: 700 }}>
                Create Your Account
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Join Rent Easy — Hyderabad's #1 rental platform
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
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Benefits */}
            <div className="mb-5 bg-orange-50 rounded-xl p-4 space-y-1.5">
              {(role === 'owner'
                ? ['List unlimited properties', 'Upload 3D tours & photos', 'Connect with verified tenants']
                : ['Browse all Hyderabad listings', 'View full-screen image gallery', 'Contact owners directly']
              ).map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-orange-800">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ravi Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Email Address *
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
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-gray-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
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
              <div>
                <label className="block text-sm text-gray-700 mb-1.5" style={{ fontWeight: 600 }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 bg-gray-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
                style={{ fontWeight: 700 }}
              >
                {loading ? 'Creating Account...' : `Create ${role === 'owner' ? 'Owner' : 'Tenant'} Account`}
              </button>
            </form>

            <p className="text-center mt-6 text-gray-600 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-orange-600 hover:text-orange-700 underline" style={{ fontWeight: 600 }}>
                Sign In
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