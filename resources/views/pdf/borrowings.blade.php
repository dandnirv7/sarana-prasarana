<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Daftar Peminjaman</title>
    <style>
        body { font-family: sans-serif; font-size: 12px }
        table { width: 100%; border-collapse: collapse }
        th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
        }
        th { background: #eee }
    </style>
</head>
<body>

<h3>Daftar Peminjaman</h3>

<table>
    <thead>
        <tr>
            <th>Nama</th>
            <th>Aset</th>
            <th>Tanggal Peminjaman</th>
            <th>Tanggal Pengembalian</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($borrowings as $b)
            <tr>
                <td>{{ $b->user->name }}</td>
                <td>{{ $b->asset->name }}</td>
                <td>{{ $b->borrow_date }}</td>
                <td>{{ $b->return_date }}</td>
                <td>{{ $b->status->name }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

</body>
</html>
