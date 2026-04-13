import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
export const page = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

page.definition = {
    methods: ["get","head"],
    url: '/api',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
page.url = (options?: RouteQueryOptions) => {
    return page.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
page.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: page.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
page.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: page.url(options),
    method: 'head',
})

const api = {
    page: Object.assign(page, page),
}

export default api