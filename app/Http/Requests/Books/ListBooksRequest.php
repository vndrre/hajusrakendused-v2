<?php

namespace App\Http\Requests\Books;

use Illuminate\Foundation\Http\FormRequest;

class ListBooksRequest extends FormRequest
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
            // Accept common checkbox/URL representations.
            'mine' => ['nullable', 'in:true,false,1,0,on,off'],
            'q' => ['nullable', 'string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'publication_year' => ['nullable', 'integer', 'min:1000', 'max:3000'],

            // Sorting.
            'sort' => ['nullable', 'string', 'in:title,author,publication_year,created_at'],
            'direction' => ['nullable', 'string', 'in:asc,desc'],

            // Page size.
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
