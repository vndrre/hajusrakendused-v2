import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/stripe/checkout-session'
*/
export const checkoutSession = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkoutSession.url(options),
    method: 'post',
})

checkoutSession.definition = {
    methods: ["post"],
    url: '/stripe/checkout-session',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/stripe/checkout-session'
*/
checkoutSession.url = (options?: RouteQueryOptions) => {
    return checkoutSession.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:13
* @route '/stripe/checkout-session'
*/
checkoutSession.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkoutSession.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
export const checkoutSessionStatus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSessionStatus.url(options),
    method: 'get',
})

checkoutSessionStatus.definition = {
    methods: ["get","head"],
    url: '/stripe/checkout-session-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
checkoutSessionStatus.url = (options?: RouteQueryOptions) => {
    return checkoutSessionStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
checkoutSessionStatus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSessionStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:114
* @route '/stripe/checkout-session-status'
*/
checkoutSessionStatus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkoutSessionStatus.url(options),
    method: 'head',
})

const stripe = {
    checkoutSession: Object.assign(checkoutSession, checkoutSession),
    checkoutSessionStatus: Object.assign(checkoutSessionStatus, checkoutSessionStatus),
}

export default stripe