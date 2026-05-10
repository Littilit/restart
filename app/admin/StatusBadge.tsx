import type { CustomerStatus } from '@prisma/client';

const CONFIG: Record<CustomerStatus, { label: string; className: string }> = {
  neukunde:          { label: 'Neukunde',           className: 'bg-blue-100 text-blue-800' },
  startangebot:      { label: 'Im Startangebot',    className: 'bg-orange-100 text-orange-800' },
  mitglied:          { label: 'Mitglied gewonnen',  className: 'bg-green-100 text-green-800' },
  karten_kunde:      { label: 'Karten gekauft',     className: 'bg-emerald-100 text-emerald-800' },
  aggregator:        { label: 'Aggregator',          className: 'bg-purple-100 text-purple-800' },
  angebot_nachfassen:{ label: 'Nachfassen',         className: 'bg-yellow-100 text-yellow-800' },
  kein_kauf:         { label: 'Kein Kauf',          className: 'bg-gray-100 text-gray-600' },
};

export default function StatusBadge({ status }: { status: CustomerStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export { CONFIG as STATUS_CONFIG };
