import type { AuditLogRow } from '@/types/analytics';

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'created',
  UPDATE: 'updated',
  DELETE: 'deleted',
  SIGN: 'signed',
  LOGIN: 'logged in',
};

export function AuditLogTable({ data }: { data: AuditLogRow[] }) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No audit activity yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Actor</th>
            <th className="pb-2 pr-4 font-medium">Action</th>
            <th className="pb-2 pr-4 font-medium">Entity</th>
            <th className="pb-2 font-medium">When</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="border-b last:border-0">
              <td className="py-2 pr-4">{row.actor ? `${row.actor.firstName} ${row.actor.lastName}` : 'System'}</td>
              <td className="py-2 pr-4">{ACTION_LABEL[row.action] ?? row.action.toLowerCase()}</td>
              <td className="py-2 pr-4 text-muted-foreground">{row.entityType}</td>
              <td className="py-2 text-muted-foreground">{new Date(row.createdAt).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
