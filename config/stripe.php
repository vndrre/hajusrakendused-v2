<?php

return [
    'secret_key' => env('STRIPE_SECRET_KEY'),
    'public_key' => env('STRIPE_PUBLIC_KEY'),
    'currency' => env('STRIPE_CURRENCY', 'usd'),
];
