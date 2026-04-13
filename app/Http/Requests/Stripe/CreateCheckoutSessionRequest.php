<?php

namespace App\Http\Requests\Stripe;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class CreateCheckoutSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'customer' => ['required', 'array'],
            'customer.firstName' => ['required', 'string', 'max:100'],
            'customer.lastName' => ['required', 'string', 'max:100'],
            'customer.email' => ['required', 'string', 'email:rfc', 'max:255'],
            'customer.phone' => [
                'required',
                'string',
                'max:30',
                'regex:/^\+?[0-9\s\-()]{7,30}$/',
                function (string $attribute, mixed $value, Closure $fail): void {
                    $digitsOnly = preg_replace('/\D/', '', (string) $value) ?? '';
                    if (strlen($digitsOnly) < 7) {
                        $fail('The '.$attribute.' must include at least 7 digits.');
                    }
                },
            ],
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'integer', 'min:1', 'exists:products,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $customer = (array) $this->input('customer', []);

        $this->merge([
            'customer' => [
                ...$customer,
                'firstName' => trim((string) ($customer['firstName'] ?? '')),
                'lastName' => trim((string) ($customer['lastName'] ?? '')),
                'email' => trim((string) ($customer['email'] ?? '')),
                'phone' => trim((string) ($customer['phone'] ?? '')),
            ],
        ]);
    }
}
