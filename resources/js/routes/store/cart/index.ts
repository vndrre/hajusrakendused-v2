import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/store/cart',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StoreController::index
* @see app/Http/Controllers/StoreController.php:30
* @route '/api/store/cart'
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
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
export const sync = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: sync.url(options),
    method: 'put',
})

sync.definition = {
    methods: ["put"],
    url: '/api/store/cart',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
sync.url = (options?: RouteQueryOptions) => {
    return sync.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
sync.put = (options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: sync.url(options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
const syncForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StoreController::sync
* @see app/Http/Controllers/StoreController.php:37
* @route '/api/store/cart'
*/
syncForm.put = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: sync.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PUT',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

sync.form = syncForm

const cart = {
    index: Object.assign(index, index),
    sync: Object.assign(sync, sync),
}

export default cart