import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:12
* @route '/map'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/map',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:12
* @route '/map'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:12
* @route '/map'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarkerController::index
* @see app/Http/Controllers/MarkerController.php:12
* @route '/map'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const map = {
    index: Object.assign(index, index),
}

export default map