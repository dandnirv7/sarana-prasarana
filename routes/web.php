<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AssetReturnController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)
        ->middleware('permission:view dashboard')
        ->name('dashboard');

    Route::middleware('permission:manage users')->group(function () {
        Route::resource('users', UserController::class)->except(['show']);
        Route::get('users/export/excel', [UserController::class, 'exportExcel'])
            ->name('users.export.excel');
        Route::get('users/export/pdf', [UserController::class, 'exportPdf'])
            ->name('users.export.pdf');
    });

    Route::middleware('permission:manage categories')->group(function () {
        Route::resource('categories', CategoryController::class);
    });

    Route::middleware('permission:manage assets')->group(function () {
        Route::resource('asset', AssetController::class);
        Route::get('asset/export/excel', [AssetController::class, 'exportExcel'])
            ->name('asset.export.excel');
        Route::get('asset/export/pdf', [AssetController::class, 'exportPdf'])
            ->name('asset.export.pdf');
    });

    Route::middleware('permission:manage assets')->group(function () {
        Route::resource('asset', AssetController::class);
        Route::get('asset/export/excel', [AssetController::class, 'exportExcel'])
            ->name('asset.export.excel');
        Route::get('asset/export/pdf', [AssetController::class, 'exportPdf'])
            ->name('asset.export.pdf');
    });

    Route::middleware('permission:borrow asset')->group(function () {
        Route::get('borrowings', [BorrowingController::class, 'index'])->name('borrowings.index');
        Route::post('borrowings', [BorrowingController::class, 'store'])->name('borrowings.store');
        Route::patch('borrowings/{borrowing}/approve', [BorrowingController::class, 'approve'])
            ->name('borrowings.approve');
        Route::patch('borrowings/{borrowing}/reject', [BorrowingController::class, 'reject'])
            ->name('borrowings.reject');
        Route::patch('borrowings/{borrowing}/return', [BorrowingController::class, 'confirmReturn'])
            ->name('borrowings.confirmReturn');
        Route::delete('borrowings/{borrowing}', [BorrowingController::class, 'destroy'])
            ->name('borrowings.destroy');
        Route::get('borrowings/export/excel', [BorrowingController::class, 'exportExcel'])
            ->name('borrowings.export.excel');
        Route::get('borrowings/export/pdf', [BorrowingController::class, 'exportPdf'])
            ->name('borrowings.export.pdf');
        Route::post('borrowings/export-pdf-email', [BorrowingController::class, 'exportPdfAndEmail']);
        Route::post('borrowings/export-excel-email', [BorrowingController::class, 'exportExcelAndEmail']);
    });

    Route::middleware('permission:return asset')->group(function () {
        Route::get('returns', [AssetReturnController::class, 'index'])->name('returns.index');
        Route::post('returns', [AssetReturnController::class, 'store'])->name('returns.store');
        Route::patch('returns/{assetReturn}/return', [AssetReturnController::class, 'confirmReturn'])
            ->name('returns.confirmReturn');
        Route::delete('returns/{borrowing}', [AssetReturnController::class, 'destroy'])
            ->name('returns.destroy');
        Route::get('returns/export/excel', [AssetReturnController::class, 'exportExcel'])
            ->name('returns.export.excel');
        Route::get('returns/export/pdf', [AssetReturnController::class, 'exportPdf'])
            ->name('returns.export.pdf');
    });

    Route::middleware('permission:view reports')->group(function () {
        Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('reports/export/excel', [ReportController::class, 'exportExcel'])
            ->name('reports.export.excel');
        Route::get('reports/export/pdf', [ReportController::class, 'exportPdf'])
            ->name('reports.export.pdf');
    });

    Route::prefix('settings')->group(function () {
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        Route::middleware('permission:manage categories')->group(function () {
            Route::resource('categories', CategoryController::class);
        });

        Route::middleware('permission:manage statuses')->group(function () {
            Route::resource('statuses', StatusController::class);
        });
    });
});

require __DIR__.'/settings.php';
