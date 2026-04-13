import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
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
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:17
* @route '/store'
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
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
export const cartIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cartIndex.url(options),
    method: 'get',
})

cartIndex.definition = {
    methods: ["get","head"],
    url: '/api/store/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
cartIndex.url = (options?: RouteQueryOptions) => {
    return cartIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
cartIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: cartIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
cartIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: cartIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
const cartIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: cartIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
cartIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: cartIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::cartIndex
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
cartIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: cartIndex.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

cartIndex.form = cartIndexForm

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
export const cartSync = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: cartSync.url(options),
    method: 'put',
})

cartSync.definition = {
    methods: ["put"],
    url: '/api/store/cart',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
cartSync.url = (options?: RouteQueryOptions) => {
    return cartSync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
cartSync.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: cartSync.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
const cartSyncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cartSync.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StoreController::cartSync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
cartSyncForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: cartSync.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

cartSync.form = cartSyncForm

const StoreController = { index, cartIndex, cartSync }

export default StoreController