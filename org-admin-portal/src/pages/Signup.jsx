import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineFlag } from 'react-icons/hi';
import { orgAdminSignup } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await orgAdminSignup(values);
      login(res.data.token, res.data.user);
      toast.success('Organization created — welcome!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <HiOutlineFlag className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Create your organization</h1>
          <p className="mt-1 text-sm text-brand-100">Set up your workspace and admin account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text">Organization name</label>
              <input className="input-field" placeholder="Acme Corp" {...register('organizationName', { required: 'Organization name is required' })} />
              {errors.organizationName && <p className="error-text">{errors.organizationName.message}</p>}
            </div>
            <div>
              <label className="label-text">Your name</label>
              <input className="input-field" placeholder="Jordan Lee" {...register('name', { required: 'Name is required' })} />
              {errors.name && <p className="error-text">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label-text">Email address</label>
              <input type="email" className="input-field" placeholder="you@company.com" {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label-text">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 8 characters, one number"
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
              />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating…' : 'Create Organization & Account'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm text-brand-100">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-white underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
