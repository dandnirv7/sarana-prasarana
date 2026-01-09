<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Konfirmasi Pengembalian Aset</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            background-color: #f4f6f8;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
            margin: auto;
            padding: 24px;
            border-radius: 8px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 12px;
        }
        .header h1 {
            margin: 0;
            color: #1f2937;
        }
        .content {
            margin-top: 20px;
            color: #374151;
            font-size: 14px;
        }
        .info {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin-top: 12px;
        }
        .footer {
            margin-top: 24px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>📦 Konfirmasi Pengembalian Aset</h1>
        <p>Sistem Informasi Sarana & Prasarana</p>
    </div>

    <div class="content">
        <p>Halo <strong>{{ $user->name }}</strong>,</p>

        <p>
            Pengembalian aset berikut telah
            <strong>dikonfirmasi oleh admin</strong>.
        </p>

        <div class="info">
            <ul>
                <li><strong>Nama Aset:</strong> {{ $asset->name }}</li>
                <li><strong>Tanggal Kembali:</strong> {{ $returnedAt }}</li>
                <li><strong>Kondisi Aset:</strong> {{ $condition }}</li>
            </ul>

            @if(!empty($note))
                <p>
                    <strong>Catatan Admin:</strong><br>
                    {{ $note }}
                </p>
            @endif
        </div>

        <p>
            Terima kasih telah menggunakan sistem peminjaman aset.
        </p>
    </div>

    <div class="footer">
        <p>
            Email ini dikirim secara otomatis oleh sistem.<br>
            &copy; {{ date('Y') }} Sistem Informasi Sarana & Prasarana
        </p>
    </div>
</div>

</body>
</html>
