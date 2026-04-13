import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/store/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/store/cart'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: sync.url(options),
    method: 'put',
})

sync.definition = {
    methods: ["put"],
    url: '/store/cart',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/store/cart'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/store/cart'
*/
sync.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: sync.url(options),
    method: 'put',
})

const cart = {
    index: Object.assign(index, index),
    sync: Object.assign(sync, sync),
}

export default cart