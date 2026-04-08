<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use Inertia\Inertia;
use Inertia\Response;

class PasswordController extends Controller
{
    /**
     * Show the user's password settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('settings/Password');
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): \Symfony\Component\HttpFoundation\Response
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        return Inertia::location(route('user-password.edit'));
    }
}
