<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Peminjaman Disetujui</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; }
        .container { max-width: 600px; background: #fff; margin: auto; padding: 24px; border-radius: 8px; }
        .header { text-align: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px; }
        .header h1 { margin: 0; color: #1f2937; }
        .content { margin-top: 20px; color: #374151; font-size: 14px; }
        .footer { margin-top: 24px; font-size: 12px; color: #6b7280; text-align: center; }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h1>✅ Peminjaman Disetujui</h1>
    </div>
    <div class="content">
        <p>Halo {{ $user->name }},</p>
        <p>Aset <strong>{{ $asset->name }}</strong> telah dikembalikan.</p>
        <p>Kondisi Aset: {{ $asset_condition }}</p>
        <p>Catatan: {{ $note ?? '-' }}</p>
    </div>
    <div class="footer">
        Email ini dikirim otomatis oleh sistem.<br>
        &copy; {{ date('Y') }} Sistem Informasi Sarana & Prasarana
    </div>
</div>
</body>
</html>
