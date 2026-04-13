import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/books'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/books',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/books'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/books'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::index
* @see app/Http/Controllers/BooksController.php:27
* @route '/books'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/books'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/books',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/books'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::store
* @see app/Http/Controllers/BooksController.php:128
* @route '/books'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

const api = {
    index: Object.assign(index, index),
    store: Object.assign(store, store),
}

export default api