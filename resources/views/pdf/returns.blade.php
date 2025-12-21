<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Pengembalian Aset</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #000; padding: 6px; }
        th { background: #f0f0f0; }
    </style>
</head>
<body>

<h3>Laporan Pengembalian Aset</h3>

<table>
    <thead>
        <tr>
            <th>Peminjam</th>
            <th>Aset</th>
            <th>Tanggal</th>
            <th>Kondisi</th>
            <th>Catatan</th>
        </tr>
    </thead>
    <tbody>
        @foreach($returns as $item)
            <tr>
                <td>{{ $item->borrowing->user->name }}</td>
                <td>{{ $item->borrowing->asset->name }}</td>
                <td>{{ $item->return_date_actual }}</td>
                <td>{{ $item->asset_condition }}</td>
                <td>{{ $item->note }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

</body>
</html>
