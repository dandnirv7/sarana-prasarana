import { usePage } from '@inertiajs/react'

export default function Reports() {
  const { summary, borrowings } = usePage().props as any

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Laporan</h1>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">{key}</p>
            <p className="text-xl font-bold">{value as number}</p>
          </div>
        ))}
      </div>

      <table className="w-full border">
        <thead>
          <tr>
            <th>User</th>
            <th>Aset</th>
            <th>Status</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {borrowings.map((b: any) => (
            <tr key={b.id}>
              <td>{b.user.name}</td>
              <td>{b.asset.name}</td>
              <td>{b.status}</td>
              <td>{b.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
