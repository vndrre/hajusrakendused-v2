import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
import cart from './cart'
/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/store',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const store = {
    index: Object.assign(index, index),
    cart: Object.assign(cart, cart),
}

export default store