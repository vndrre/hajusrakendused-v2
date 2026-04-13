import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/api/stripe/checkout-session'
*/
export const createCheckoutSession = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createCheckoutSession.url(options),
    method: 'post',
})

createCheckoutSession.definition = {
    methods: ["post"],
    url: '/api/stripe/checkout-session',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/api/stripe/checkout-session'
*/
createCheckoutSession.url = (options?: RouteQueryOptions) => {
    return createCheckoutSession.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/api/stripe/checkout-session'
*/
createCheckoutSession.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createCheckoutSession.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/api/stripe/checkout-session'
*/
const createCheckoutSessionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createCheckoutSession.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/api/stripe/checkout-session'
*/
createCheckoutSessionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: createCheckoutSession.url(options),
    method: 'post',
})

createCheckoutSession.form = createCheckoutSessionForm

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
export const verifyCheckoutSession = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verifyCheckoutSession.url(options),
    method: 'get',
})

verifyCheckoutSession.definition = {
    methods: ["get","head"],
    url: '/api/stripe/checkout-session-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
verifyCheckoutSession.url = (options?: RouteQueryOptions) => {
    return verifyCheckoutSession.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
verifyCheckoutSession.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verifyCheckoutSession.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
verifyCheckoutSession.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verifyCheckoutSession.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
const verifyCheckoutSessionForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: verifyCheckoutSession.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
verifyCheckoutSessionForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: verifyCheckoutSession.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/api/stripe/checkout-session-status'
*/
verifyCheckoutSessionForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: verifyCheckoutSession.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

verifyCheckoutSession.form = verifyCheckoutSessionForm

const StripeCheckoutController = { createCheckoutSession, verifyCheckoutSession }

export default StripeCheckoutController