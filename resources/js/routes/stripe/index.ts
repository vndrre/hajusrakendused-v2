import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:12
* @route '/api/stripe/checkout-session'
*/
export const checkoutSession = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkoutSession.url(options),
    method: 'post',
})

checkoutSession.definition = {
    methods: ["post"],
    url: '/api/stripe/checkout-session',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:12
* @route '/api/stripe/checkout-session'
*/
checkoutSession.url = (options?: RouteQueryOptions) => {
    return checkoutSession.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:12
* @route '/api/stripe/checkout-session'
*/
checkoutSession.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkoutSession.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:12
* @route '/api/stripe/checkout-session'
*/
const checkoutSessionForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkoutSession.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSession
* @see app/Http/Controllers/StripeCheckoutController.php:12
* @route '/api/stripe/checkout-session'
*/
checkoutSessionForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: checkoutSession.url(options),
    method: 'post',
})

checkoutSession.form = checkoutSessionForm

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
export const checkoutSessionStatus = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSessionStatus.url(options),
    method: 'get',
})

checkoutSessionStatus.definition = {
    methods: ["get","head"],
    url: '/api/stripe/checkout-session-status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
checkoutSessionStatus.url = (options?: RouteQueryOptions) => {
    return checkoutSessionStatus.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
checkoutSessionStatus.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: checkoutSessionStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
checkoutSessionStatus.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: checkoutSessionStatus.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
const checkoutSessionStatusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkoutSessionStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
checkoutSessionStatusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkoutSessionStatus.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\StripeCheckoutController::checkoutSessionStatus
* @see app/Http/Controllers/StripeCheckoutController.php:122
* @route '/api/stripe/checkout-session-status'
*/
checkoutSessionStatusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: checkoutSessionStatus.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

checkoutSessionStatus.form = checkoutSessionStatusForm

const stripe = {
    checkoutSession: Object.assign(checkoutSession, checkoutSession),
    checkoutSessionStatus: Object.assign(checkoutSessionStatus, checkoutSessionStatus),
}

export default stripe