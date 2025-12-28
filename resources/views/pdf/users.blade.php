<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Daftar Pengguna</title>
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

<h3>Daftar Pengguna</h3>

<table>
    <thead>
        <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Department</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($users as $u)
            <tr>
                <td>{{ $u->name }}</td>
                <td>{{ $u->email }}</td>
                <td>{{ $u->roles->first()?->name }}</td>
                <td>{{ $u->email_verified_at ? 'Aktif' : 'Tidak Aktif' }}</td>
                <td>{{ $u->department?->value }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

</body>
</html>
