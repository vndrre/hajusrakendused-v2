import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
import api from './api'
/**
* @see \App\Http\Controllers\MarkerController::store
* @see app/Http/Controllers/MarkerController.php:40
* @route '/markers'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/markers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\MarkerController::store
* @see app/Http/Controllers/MarkerController.php:40
* @route '/markers'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarkerController::store
* @see app/Http/Controllers/MarkerController.php:40
* @route '/markers'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\MarkerController::show
* @see app/Http/Controllers/MarkerController.php:65
* @route '/markers/{marker}'
*/
export const show = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/markers/{marker}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\MarkerController::show
* @see app/Http/Controllers/MarkerController.php:65
* @route '/markers/{marker}'
*/
show.url = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { marker: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { marker: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            marker: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        marker: typeof args.marker === 'object'
        ? args.marker.id
        : args.marker,
    }

    return show.definition.url
            .replace('{marker}', parsedArgs.marker.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarkerController::show
* @see app/Http/Controllers/MarkerController.php:65
* @route '/markers/{marker}'
*/
show.get = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\MarkerController::show
* @see app/Http/Controllers/MarkerController.php:65
* @route '/markers/{marker}'
*/
show.head = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\MarkerController::update
* @see app/Http/Controllers/MarkerController.php:76
* @route '/markers/{marker}'
*/
export const update = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put"],
    url: '/markers/{marker}',
} satisfies RouteDefinition<["put"]>

/**
* @see \App\Http\Controllers\MarkerController::update
* @see app/Http/Controllers/MarkerController.php:76
* @route '/markers/{marker}'
*/
update.url = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { marker: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { marker: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            marker: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        marker: typeof args.marker === 'object'
        ? args.marker.id
        : args.marker,
    }

    return update.definition.url
            .replace('{marker}', parsedArgs.marker.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarkerController::update
* @see app/Http/Controllers/MarkerController.php:76
* @route '/markers/{marker}'
*/
update.put = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\MarkerController::destroy
* @see app/Http/Controllers/MarkerController.php:102
* @route '/markers/{marker}'
*/
export const destroy = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/markers/{marker}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\MarkerController::destroy
* @see app/Http/Controllers/MarkerController.php:102
* @route '/markers/{marker}'
*/
destroy.url = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { marker: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { marker: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            marker: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        marker: typeof args.marker === 'object'
        ? args.marker.id
        : args.marker,
    }

    return destroy.definition.url
            .replace('{marker}', parsedArgs.marker.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\MarkerController::destroy
* @see app/Http/Controllers/MarkerController.php:102
* @route '/markers/{marker}'
*/
destroy.delete = (args: { marker: string | number | { id: string | number } } | [marker: string | number | { id: string | number } ] | string | number | { id: string | number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const markers = {
    api: Object.assign(api, api),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default markers