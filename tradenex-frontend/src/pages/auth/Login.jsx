import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) navigate(user.role === 'Admin' ? '/admin' : '/products', { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = (data) => dispatch(loginUser(data));

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{ backgroundColor: '#3F454D', color: '#F7F5EF' }}>
        <div className="font-display text-2xl font-bold">
          Trade<span style={{ color: '#8FAF8B' }}>Nex</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Digital Trade &<br />Inventory Platform
          </h1>
          <p className="text-lg" style={{ color: '#CFCAB8' }}>
            Manage products, orders, and quotes for tile installation materials across Pakistan & Saudi Arabia.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Products', value: '200+' },
              { label: 'Active Orders', value: '1,400+' },
              { label: 'Quotes', value: '350+' },
              { label: 'Customers', value: '80+' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
                <p className="font-display text-2xl font-bold" style={{ color: '#8FAF8B' }}>{s.value}</p>
                <p className="text-sm mt-1" style={{ color: '#CFCAB8' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm" style={{ color: '#66707A' }}>© 2024 MZ Peckers. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#E8E4D1' }}>
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="lg:hidden font-display text-2xl font-bold mb-6" style={{ color: '#3F454D' }}>
              Trade<span style={{ color: '#8FAF8B' }}>Nex</span>
            </div>
            <h2 className="font-display text-3xl font-bold" style={{ color: '#3F454D' }}>Welcome back</h2>
            <p className="mt-2" style={{ color: '#66707A' }}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F454D' }}>Email address</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-base" />
              {errors.email && <p className="text-xs mt-1" style={{ color: '#C97B5E' }}>{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <label className="block text-sm font-semibold" style={{ color: '#3F454D' }}>Password</label>
              </div>
              <input {...register('password')} type="password" placeholder="••••••••" className="input-base" />
              {errors.password && <p className="text-xs mt-1" style={{ color: '#C97B5E' }}>{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#66707A' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold hover:underline" style={{ color: '#8FAF8B' }}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
