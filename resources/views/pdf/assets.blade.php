<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Aset</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; }
        th { background-color: #f0f0f0; }
        h2 { text-align: center; }
    </style>
</head>
<body>
    <h2>Laporan Data Aset</h2>
    <table>
        <thead>
            <tr>
                <th>Nama</th>
                <th>Kategori</th>
                <th>Kondisi</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($assets as $asset)
                <tr>
                    <td>{{ $asset->name }}</td>
                    <td>{{ $asset->category->name ?? $asset->category_name }}</td>
                    <td>{{ $asset->condition }}</td>
                    <td>{{ $asset->status->name ?? $asset->status_name }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
