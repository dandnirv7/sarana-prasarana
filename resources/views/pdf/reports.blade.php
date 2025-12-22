<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Peminjaman</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 6px; text-align: left; }
        th { background-color: #f0f0f0; }
        h2 { text-align: center; }
    </style>
</head>
<body>
    <h2>Laporan Peminjaman</h2>
    <p>Periode: {{ request('start_date') }} - {{ request('end_date') }}</p>
    <p>Status: {{ request('status') ?? 'Semua' }}</p>

    <table>
        <thead>
            <tr>
                <th>Peminjam</th>
                <th>Nama Aset</th>
                <th>Tgl Pinjam</th>
                <th>Tgl Kembali</th>
                <th>Kondisi</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($borrowings as $item)
            <tr>
                <td>{{ $item->user->name }}</td>
                <td>{{ $item->asset->name }}</td>
                <td>{{ $item->borrow_date }}</td>
                <td>{{ $item->return_date ?? '-' }}</td>
                <td>{{ $item->asset_condition }}</td>
                <td>{{ $item->status }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
