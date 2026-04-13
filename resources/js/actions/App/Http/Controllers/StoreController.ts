import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
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

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
export const cartIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cartIndex.url(options),
    method: 'get',
})

cartIndex.definition = {
    methods: ["get","head"],
    url: '/store/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
cartIndex.url = (options?: RouteQueryOptions) => {
    return cartIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
cartIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cartIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/store/cart'
*/
cartIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cartIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/store/cart'
*/
export const cartSync = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: cartSync.url(options),
    method: 'put',
})

cartSync.definition = {
    methods: ["put"],
    url: '/store/cart',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/store/cart'
*/
cartSync.url = (options?: RouteQueryOptions) => {
    return cartSync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/store/cart'
*/
cartSync.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: cartSync.url(options),
    method: 'put',
})

const StoreController = { index, cartIndex, cartSync }

export default StoreController