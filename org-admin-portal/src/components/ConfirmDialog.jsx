import React from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';

const ConfirmDialog = ({ title, message, confirmLabel = 'Confirm', onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
    <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
          <HiOutlineExclamation className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <button onClick={onCancel} className="btn-secondary">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="btn-danger">
          {loading ? 'Please wait…' : confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
