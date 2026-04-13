import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/books',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/api/books'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/api/books'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/books',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/api/books'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/api/books'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/api/books'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/api/books'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const api = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
}

export default api