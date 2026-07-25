import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiOutlineX } from 'react-icons/hi';
import { createOrgAdmin } from '../services/orgService.js';

/**
 * Lets a Super Admin provision the first Org Admin for an organization
 * that was created via the Super Admin console (rather than through the
 * Org Admin self-service signup flow, which creates its own org).
 */
const CreateOrgAdminModal = ({ org, onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await createOrgAdmin(org._id, values);
      toast.success('Organization admin created');
      onCreated(res.data.admin);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organization admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900">Add Organization Admin</h3>
            <p className="text-xs text-slate-400">for {org.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Admin name</label>
            <input className="input-field" placeholder="Jordan Lee" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label-text">Email</label>
            <input type="email" className="input-field" placeholder="admin@company.com" {...register('email', { required: 'Email is required' })} />
            {errors.email && <p className="error-text">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label-text">Temporary password</label>
            <input
              type="password"
              className="input-field"
              placeholder="At least 8 characters, one number"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
            />
            {errors.password && <p className="error-text">{errors.password.message}</p>}
          </div>
          <p className="text-xs text-slate-400">
            Share these credentials with the admin — they'll log in at the Org Admin Portal.
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating…' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrgAdminModal;