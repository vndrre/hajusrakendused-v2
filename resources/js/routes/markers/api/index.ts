import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:29
* @route '/markers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/markers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:29
* @route '/markers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:29
* @route '/markers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:29
* @route '/markers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const api = {
    index: Object.assign(index, index),
}

export default api