import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { HiOutlineX } from 'react-icons/hi';
import { createFlag, updateFlag } from '../services/flagService.js';

/**
 * Shared create/edit modal. When `flag` is provided, the form pre-fills
 * and submits go through the update endpoint; the key becomes read-only
 * since keys are immutable once created (evaluation clients depend on it).
 */
const FlagFormModal = ({ flag, onClose, onSaved }) => {
  const isEdit = Boolean(flag);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: flag
      ? {
          key: flag.key,
          name: flag.name,
          description: flag.description,
          isEnabled: flag.isEnabled,
          rolloutPercentage: flag.rolloutPercentage,
          scheduledReleaseAt: flag.scheduledReleaseAt ? flag.scheduledReleaseAt.slice(0, 16) : '',
        }
      : { rolloutPercentage: 100, isEnabled: false },
  });
  const [loading, setLoading] = useState(false);
  const rollout = watch('rolloutPercentage');

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        rolloutPercentage: Number(values.rolloutPercentage),
        scheduledReleaseAt: values.scheduledReleaseAt ? new Date(values.scheduledReleaseAt).toISOString() : null,
      };
      if (isEdit) {
        const res = await updateFlag(flag._id, payload);
        toast.success('Feature flag updated');
        onSaved(res.data.flag);
      } else {
        const res = await createFlag(payload);
        toast.success('Feature flag created');
        onSaved(res.data.flag);
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save feature flag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 px-4 py-8">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-slate-900">{isEdit ? 'Edit Feature Flag' : 'New Feature Flag'}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <HiOutlineX className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label-text">Key</label>
            <input
              className="input-field disabled:bg-slate-100 disabled:text-slate-400"
              placeholder="new-checkout-flow"
              disabled={isEdit}
              {...register('key', {
                required: !isEdit && 'Key is required',
                pattern: { value: /^[a-z0-9][a-z0-9-_]*$/i, message: 'Letters, numbers, hyphens, underscores only' },
              })}
            />
            {errors.key && <p className="error-text">{errors.key.message}</p>}
            {!isEdit && <p className="mt-1 text-xs text-slate-400">Machine-readable identifier — cannot be changed later.</p>}
          </div>
          <div>
            <label className="label-text">Display name</label>
            <input className="input-field" placeholder="New Checkout Flow" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="error-text">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea className="input-field" rows={2} placeholder="What does this flag control?" {...register('description')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">Rollout percentage: {rollout ?? 0}%</label>
              <input type="range" min="0" max="100" className="w-full accent-brand-600" {...register('rolloutPercentage')} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded accent-brand-600" {...register('isEnabled')} />
                Enabled (master toggle)
              </label>
            </div>
          </div>

          <div>
            <label className="label-text">Scheduled release (optional)</label>
            <input type="datetime-local" className="input-field" {...register('scheduledReleaseAt')} />
            <p className="mt-1 text-xs text-slate-400">Feature stays inactive until this time passes, even if enabled.</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Flag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlagFormModal;
