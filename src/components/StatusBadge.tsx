
import { MaintenanceStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: MaintenanceStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusDetails = () => {
    switch (status) {
      case 'received':
        return {
          label: 'Lançado',
          className: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'sent':
        return {
          label: 'Entregue',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'completed':
        return {
          label: 'Devolvido',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const { label, className: statusClassName } = getStatusDetails();

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
        statusClassName,
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
