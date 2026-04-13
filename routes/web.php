<?php

use App\Http\Controllers\BooksController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\MarkerController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StripeCheckoutController;
use App\Http\Controllers\WeatherController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'Welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'Dashboard')->name('dashboard');

    Route::get('weather', [WeatherController::class, 'show'])->name('weather.show');
    Route::get('weather/data', [WeatherController::class, 'api'])->name('weather.api');
    Route::post('weather/selection', [WeatherController::class, 'selection'])->name('weather.selection');
    Route::get('map', [MarkerController::class, 'index'])->name('map.index');
    Route::get('store', [StoreController::class, 'index'])->name('store.index');
    Route::get('store/cart', [StoreController::class, 'cartIndex'])->name('store.cart.index');
    Route::put('store/cart', [StoreController::class, 'cartSync'])->name('store.cart.sync');

    Route::get('api', [BooksController::class, 'apiPage'])->name('api.page');
    Route::get('books', [BooksController::class, 'apiIndex'])->name('books.api.index');
    Route::post('books', [BooksController::class, 'apiStore'])->name('books.api.store');

    Route::prefix('stripe')->group(function () {
        Route::post('checkout-session', [StripeCheckoutController::class, 'createCheckoutSession'])
            ->name('stripe.checkout-session');
        Route::get('checkout-session-status', [StripeCheckoutController::class, 'verifyCheckoutSession'])
            ->name('stripe.checkout-session-status');
    });

    Route::prefix('markers')->group(function () {
        Route::get('/', [MarkerController::class, 'apiIndex'])->name('markers.api.index');
        Route::post('/', [MarkerController::class, 'store'])->name('markers.store');
        Route::get('/{marker}', [MarkerController::class, 'show'])->name('markers.show');
        Route::put('/{marker}', [MarkerController::class, 'update'])->name('markers.update');
        Route::delete('/{marker}', [MarkerController::class, 'destroy'])->name('markers.destroy');
    });

    Route::get('blog', [PostController::class, 'index'])->name('blog.index');
    Route::post('blog', [PostController::class, 'store'])->name('blog.store');
    Route::put('blog/{post}', [PostController::class, 'update'])->name('blog.update');
    Route::delete('blog/{post}', [PostController::class, 'destroy'])->name('blog.destroy');

    Route::post('blog/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::delete('comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');
    Route::put('comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
});

require __DIR__.'/settings.php';
