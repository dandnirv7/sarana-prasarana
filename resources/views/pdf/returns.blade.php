<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Pengembalian Aset</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            margin: 20px;
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14px;
        }
        th, td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
        }
        th {
            background-color: #e5e7eb;
            font-weight: bold;
        }
        tbody tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            font-size: 10px;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>

<div class="header">
    <img src="{{ public_path('logo.svg') }}" alt="Logo">
    <div>
        <div class="title">Laporan Pengembalian Aset</div>
        <div class="subtitle">
            Sistem Informasi Sarana & Prasarana<br>
            Dicetak: {{ now()->translatedFormat('d F Y H:i') }}
        </div>
    </div>
</div>

<table>
    <thead>
        <tr>
            <th>No</th>
            <th>Peminjam</th>
            <th>Aset</th>
            <th>Tanggal Pengembalian</th>
            <th>Kondisi Aset</th>
            <th>Catatan</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($returns as $item)
            <tr>
                <td>{{ $loop->iteration }}</td>
                <td>{{ $item->borrowing->user->name }}</td>
                <td>{{ $item->borrowing->asset->name }}</td>
                <td>{{ \Carbon\Carbon::parse($item->return_date_actual)->translatedFormat('d F Y') }}</td>
                <td>{{ $item->asset_condition }}</td>
                <td>{{ $item->note ?? '-' }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<div class="footer">
    &copy; {{ date('Y') }} Sistem Informasi Sarana & Prasarana
</div>

<script type="text/php">
    if (isset($pdf)) {
        $font = $fontMetrics->get_font("Arial", "normal");
        $pdf->page_text(520, 15, "Halaman {PAGE_NUM} dari {PAGE_COUNT}", $font, 9);
    }
</script>

</body>
</html>
