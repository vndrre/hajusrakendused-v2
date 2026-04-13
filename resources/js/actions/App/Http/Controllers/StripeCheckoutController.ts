import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/stripe/checkout-session'
*/
export const createCheckoutSession = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createCheckoutSession.url(options),
    method: 'post',
})

createCheckoutSession.definition = {
    methods: ["post"],
    url: '/stripe/checkout-session',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/stripe/checkout-session'
*/
createCheckoutSession.url = (options?: RouteQueryOptions) => {
    return createCheckoutSession.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::createCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/stripe/checkout-session'
*/
createCheckoutSession.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: createCheckoutSession.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
export const verifyCheckoutSession = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verifyCheckoutSession.url(options),
    method: 'get',
})

verifyCheckoutSession.definition = {
    methods: ["get","head"],
    url: '/stripe/checkout-session-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
verifyCheckoutSession.url = (options?: RouteQueryOptions) => {
    return verifyCheckoutSession.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
verifyCheckoutSession.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: verifyCheckoutSession.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::verifyCheckoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
verifyCheckoutSession.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: verifyCheckoutSession.url(options),
    method: 'head',
})

const StripeCheckoutController = { createCheckoutSession, verifyCheckoutSession }

export default StripeCheckoutController