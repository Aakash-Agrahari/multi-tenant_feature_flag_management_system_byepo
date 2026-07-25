import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiOutlineX } from 'react-icons/hi';
import { createOrganization } from '../services/orgService.js';

const CreateOrgModal = ({ onClose, onCreated }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await createOrganization(values);
      toast.success('Organization created');
      onCreated(res.data.organization);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900">New Organization</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Organization name</label>
            <input className="input-field" placeholder="Acme Corp" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label-text">Description (optional)</label>
            <textarea className="input-field" rows={3} placeholder="What does this organization do?" {...register('description')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Creating…' : 'Create Organization'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrgModal;
