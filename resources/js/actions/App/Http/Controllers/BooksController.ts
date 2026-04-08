import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
export const apiPage = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiPage.url(options),
    method: 'get',
})

apiPage.definition = {
    methods: ["get","head"],
    url: '/api',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
apiPage.url = (options?: RouteQueryOptions) => {
    return apiPage.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
apiPage.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiPage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
apiPage.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: apiPage.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
const apiPageForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiPage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
apiPageForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiPage.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::apiPage
* @see app/Http/Controllers/BooksController.php:17
* @route '/api'
*/
apiPageForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiPage.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

apiPage.form = apiPageForm

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
export const apiIndex = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiIndex.url(options),
    method: 'get',
})

apiIndex.definition = {
    methods: ["get","head"],
    url: '/api/books',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
apiIndex.url = (options?: RouteQueryOptions) => {
    return apiIndex.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
apiIndex.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: apiIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
apiIndex.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: apiIndex.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
const apiIndexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
apiIndexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiIndex.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\BooksController::apiIndex
* @see app/Http/Controllers/BooksController.php:26
* @route '/api/books'
*/
apiIndexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: apiIndex.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

apiIndex.form = apiIndexForm

/**
* @see \App\Http\Controllers\BooksController::apiStore
* @see app/Http/Controllers/BooksController.php:125
* @route '/api/books'
*/
export const apiStore = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apiStore.url(options),
    method: 'post',
})

apiStore.definition = {
    methods: ["post"],
    url: '/api/books',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\BooksController::apiStore
* @see app/Http/Controllers/BooksController.php:125
* @route '/api/books'
*/
apiStore.url = (options?: RouteQueryOptions) => {
    return apiStore.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\BooksController::apiStore
* @see app/Http/Controllers/BooksController.php:125
* @route '/api/books'
*/
apiStore.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: apiStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BooksController::apiStore
* @see app/Http/Controllers/BooksController.php:125
* @route '/api/books'
*/
const apiStoreForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apiStore.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\BooksController::apiStore
* @see app/Http/Controllers/BooksController.php:125
* @route '/api/books'
*/
apiStoreForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: apiStore.url(options),
    method: 'post',
})

apiStore.form = apiStoreForm

const BooksController = { apiPage, apiIndex, apiStore }

export default BooksController