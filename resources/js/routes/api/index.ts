import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
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

/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
const pageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: page.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
pageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: page.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::page
* @see app/Http/Controllers/BooksController.php:18
* @route '/api'
*/
pageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: page.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

page.form = pageForm

const api = {
    page: Object.assign(page, page),
}

export default api