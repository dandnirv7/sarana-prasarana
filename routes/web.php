<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\BorrowingController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::get('/test-permission', fn () => 'OK')
    ->middleware('permission:view dashboard');


Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/dashboard', DashboardController::class)
        ->middleware('permission:view dashboard')
        ->name('dashboard');
        
    Route::middleware('permission:manage users')->group(function () {
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::post('/users', [UserController::class, 'store'])->name('users.store');
        Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
        Route::get('/users/export/excel', [UserController::class, 'exportExcel'])
        ->name('users.export.excel');
        Route::get('/users/export/pdf', [UserController::class, 'exportPdf'])
        ->name('users.export.pdf');
    });

    Route::middleware('permission:manage categories')->group(function () {
        Route::resource('categories', CategoryController::class);
    });

    Route::middleware('permission:manage assets')->group(function () {
        Route::resource('assets', AssetController::class);
    });

    Route::middleware('permission:borrow asset')->group(function () {
        Route::resource('borrowings', BorrowingController::class)->only(['index', 'store']);
    });

    Route::middleware('permission:view reports')->group(function () {
        Route::get('reports', ReportController::class)->name('reports');
    });


});


require __DIR__.'/settings.php';
