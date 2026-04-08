import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
export const show = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/weather',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
show.url = (options?: RouteQueryOptions) => {
    return show.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
show.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
show.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
const showForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
showForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::show
* @see app/Http/Controllers/WeatherController.php:16
* @route '/weather'
*/
showForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: show.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

show.form = showForm

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
export const api = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: api.url(options),
    method: 'get',
})

api.definition = {
    methods: ["get","head"],
    url: '/api/weather',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
api.url = (options?: RouteQueryOptions) => {
    return api.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
api.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: api.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
api.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: api.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
const apiForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: api.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
apiForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: api.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\WeatherController::api
* @see app/Http/Controllers/WeatherController.php:40
* @route '/api/weather'
*/
apiForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: api.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

api.form = apiForm

/**
* @see \App\Http\Controllers\WeatherController::selection
* @see app/Http/Controllers/WeatherController.php:68
* @route '/api/weather/selection'
*/
export const selection = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: selection.url(options),
    method: 'post',
})

selection.definition = {
    methods: ["post"],
    url: '/api/weather/selection',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\WeatherController::selection
* @see app/Http/Controllers/WeatherController.php:68
* @route '/api/weather/selection'
*/
selection.url = (options?: RouteQueryOptions) => {
    return selection.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\WeatherController::selection
* @see app/Http/Controllers/WeatherController.php:68
* @route '/api/weather/selection'
*/
selection.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: selection.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WeatherController::selection
* @see app/Http/Controllers/WeatherController.php:68
* @route '/api/weather/selection'
*/
const selectionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: selection.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\WeatherController::selection
* @see app/Http/Controllers/WeatherController.php:68
* @route '/api/weather/selection'
*/
selectionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: selection.url(options),
    method: 'post',
})

selection.form = selectionForm

const weather = {
    show: Object.assign(show, show),
    api: Object.assign(api, api),
    selection: Object.assign(selection, selection),
}

export default weather