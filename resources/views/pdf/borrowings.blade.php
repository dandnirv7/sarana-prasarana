<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Peminjaman Aset</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            margin: 20px;
            padding: 0;
        }

        .header {
            display: flex;
            align-items: center;
            border-bottom: 2px solid #333;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }

        .header img {
            height: 50px;
            margin-right: 12px;
        }

        .header .title {
            font-size: 18px;
            font-weight: bold;
        }

        .header .subtitle {
            font-size: 12px;
            color: #555;
        }

        .filters, .summary {
            margin: 16px 0;
            background: #f4f4f4;
            padding: 10px;
            border-radius: 6px;
        }

        .filters ul {
            list-style: none;
            padding-left: 0;
            margin: 0;
        }

        .filters li {
            margin: 4px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
            word-break: break-word;
        }

        th {
            background-color: #dfe3e6;
            font-weight: bold;
        }

        tbody tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .footer {
            text-align: center;
            font-size: 10px;
            color: #666;
            position: fixed;
            bottom: 0;
            width: 100%;
        }
    </style>
</head>
<body>

<div class="header">
    <img src="{{ public_path('logo.svg') }}" alt="Logo">
    <div>
        <div class="title">Laporan Peminjaman Aset</div>
        <div class="subtitle">
            Sistem Informasi Sarana & Prasarana<br>
            Jl. Mayor Madmuin Hasibuan No.68, RT.004/RW.004, Margahayu, Kec. Bekasi Tim., Kota Bks, Jawa Barat 17113
        </div>
    </div>
</div>

<div class="filters">
    <strong>Filter Aktif:</strong>
    <ul>
        <li>Status: {{ $filters['status'] ?? 'Semua' }}</li>
        <li>Kata Kunci: {{ $filters['search'] ?? '-' }}</li>
        <li>Waktu Export: {{ $exportedAt }}</li>
    </ul>
</div>

<div class="summary">
    <strong>Ringkasan:</strong><br>
    Total Peminjaman: {{ $borrowings->count() }}<br>
    Menunggu: {{ $borrowings->where('status.name','Menunggu')->count() }} |
    Disetujui: {{ $borrowings->where('status.name','Disetujui')->count() }} |
    Ditolak: {{ $borrowings->where('status.name','Ditolak')->count() }} |
    Dikembalikan: {{ $borrowings->where('status.name','Dikembalikan')->count() }}
</div>

<table>
    <thead>
        <tr>
            <th>No</th>
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
                <td>{{ $loop->iteration }}</td>
                <td>{{ $b->user->name }}</td>
                <td>{{ $b->asset->name ?? '-' }}</td>
                <td>{{ \Carbon\Carbon::parse($b->borrow_date)->translatedFormat('d F Y') }}</td>
                <td>
                    {{ $b->return_date
                        ? \Carbon\Carbon::parse($b->return_date)->translatedFormat('d F Y')
                        : '-' }}
                </td>
                <td>{{ $b->status->name }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<div class="footer">
    &copy; {{ date('Y') }} Sistem Informasi Sarana & Prasarana - Halaman <span class="page"></span>
</div>

<script type="text/php">
    if (isset($pdf)) {
        $font = $fontMetrics->get_font("Arial, Helvetica, sans-serif", "normal");
        $size = 10;
        $y = 15;
        $x = 520;
        $pdf->page_text($x, $y, "Halaman {PAGE_NUM} dari {PAGE_COUNT}", $font, $size);
    }
</script>

</body>
</html>
