import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineSparkles } from 'react-icons/hi';
import { login as loginRequest } from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await loginRequest(values);
      login(res.data.token, res.data.user);
      toast.success('Welcome back');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-400 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
            <HiOutlineSparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">My Features</h1>
          <p className="mt-1 text-sm text-brand-100">See which features are available to you</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label-text">Email address</label>
              <input type="email" className="input-field" placeholder="you@example.com" {...register('email', { required: 'Email is required' })} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label-text">Password</label>
              <input type="password" className="input-field" placeholder="••••••••" {...register('password', { required: 'Password is required' })} />
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="mt-6 text-center text-xs text-brand-100">
          Don't have an account? Ask your organization admin to create one for you.
        </p>
      </div>
    </div>
  );
};

export default Login;
