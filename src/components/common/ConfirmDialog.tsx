import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'primary';
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Delete',
  confirmVariant = 'danger',
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <div className="modal-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: confirmVariant === 'danger' ? 'var(--color-danger-bg)' : 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: confirmVariant === 'danger' ? 'var(--color-danger)' : 'var(--color-primary)',
          }}
        >
          <AlertTriangle size={20} />
        </div>
        <div>
          <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {message}
          </p>
          <p style={{ color: 'var(--text-subtle)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            This action cannot be undone.
          </p>
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`btn ${confirmVariant === 'danger' ? 'btn-danger' : 'btn-primary'} btn-sm`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
