import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, clearError } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const schema = z.object({
  username:     z.string().min(3).max(50).regex(/^[a-zA-Z0-9]+$/, 'Letters and numbers only'),
  email:        z.string().email(),
  password:     z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Need uppercase, lowercase and number'),
  fullName:     z.string().min(2).max(100),
  phone:        z.string().min(7).max(20),
  companyName:  z.string().optional(),
  customerType: z.string().optional(),
  country:      z.string().optional(),
});

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3F454D' }}>{label}</label>
    {children}
    {error && <p className="text-xs mt-1" style={{ color: '#C97B5E' }}>{error.message}</p>}
  </div>
);

export default function Register() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const res = await dispatch(registerUser(data));
    if (!res.error) {
      toast.success('Registered! Awaiting admin approval.');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#E8E4D1' }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="font-display text-2xl font-bold mb-2" style={{ color: '#3F454D' }}>
            Trade<span style={{ color: '#8FAF8B' }}>Nex</span>
          </div>
          <h2 className="font-display text-3xl font-bold" style={{ color: '#3F454D' }}>Create your account</h2>
          <p className="mt-2" style={{ color: '#66707A' }}>Fill in your details to register</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full Name *" error={errors.fullName}>
                <input {...register('fullName')} className="input-base" placeholder="Ali Raza" />
              </Field>
              <Field label="Username *" error={errors.username}>
                <input {...register('username')} className="input-base" placeholder="ali_raza" />
              </Field>
              <Field label="Email *" error={errors.email}>
                <input {...register('email')} type="email" className="input-base" placeholder="ali@example.com" />
              </Field>
              <Field label="Phone *" error={errors.phone}>
                <input {...register('phone')} className="input-base" placeholder="0300-1234567" />
              </Field>
              <Field label="Password *" error={errors.password}>
                <input {...register('password')} type="password" className="input-base" placeholder="Min 8 chars, A-Z, a-z, 0-9" />
              </Field>
              <Field label="Customer Type" error={errors.customerType}>
                <select {...register('customerType')} className="input-base">
                  <option value="">Select type</option>
                  {['Contractor','ShopOwner','Installer','Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Company Name" error={errors.companyName}>
                <input {...register('companyName')} className="input-base" placeholder="Your company (optional)" />
              </Field>
              <Field label="Country" error={errors.country}>
                <select {...register('country')} className="input-base">
                  <option value="">Select country</option>
                  <option>Pakistan</option>
                  <option>Saudi Arabia</option>
                </select>
              </Field>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-6">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-4" style={{ color: '#66707A' }}>
          Already have an account? <Link to="/login" className="font-semibold hover:underline" style={{ color: '#8FAF8B' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
