<script setup lang="ts">
import axios from 'axios';
import { ShoppingCart } from 'lucide-vue-next';
import storeCartRoutes from '@/routes/store/cart';
import stripeRoutes from '@/routes/stripe';
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';

interface StoreProduct {
    id: number;
    name: string;
    description: string;
    price: number | string;
    image?: string | null;
    quantity: number;
}

interface CartItem {
    productId: number;
    name: string;
    price: number;
    image: string | null;
    quantity: number;
    stock: number;
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed' | 'pending';

const props = defineProps<{
    products?: StoreProduct[];
}>();

const selectedPaymentMethod = ref('Stripe');
const paymentStatus = ref<PaymentStatus>('idle');
const paymentMessage = ref('');
const showCartPopup = ref(false);

const productQuantitySelection = reactive<Record<number, number>>({});
const cart = ref<CartItem[]>([]);
const cartLoadedFromServer = ref(false);
const syncingCart = ref(false);
const suppressCartSync = ref(false);
let cartSyncTimeout: ReturnType<typeof setTimeout> | null = null;

const checkoutForm = reactive({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
});

const checkoutErrors = reactive<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
}>({});

const getStripeErrorMessage = (error: unknown): string | null => {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    const message = error.response?.data?.message;
    return typeof message === 'string' && message.trim() ? message : null;
};

const showCheckoutErrors = ref(false);

const products = computed<StoreProduct[]>(() => {
    if (!props.products) {
        return [];
    }

    return props.products.map((product) => ({
        ...product,
        price: Number(product.price) || 0,
        quantity: Number(product.quantity) || 0,
    }));
});

const productById = computed(() => {
    return new Map(products.value.map((product) => [product.id, product]));
});

const cartItemCount = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.quantity, 0);
});

const subtotal = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
});

const vat = computed(() => subtotal.value * 0.22);
const total = computed(() => subtotal.value + vat.value);

const formatPrice = (price: number | string): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price) || 0);
};

const selectedQtyFor = (product: StoreProduct): number => {
    return productQuantitySelection[product.id] ?? 1;
};

const increaseSelectedQty = (product: StoreProduct): void => {
    const current = selectedQtyFor(product);
    if (current < product.quantity) {
        productQuantitySelection[product.id] = current + 1;
    }
};

const decreaseSelectedQty = (product: StoreProduct): void => {
    const current = selectedQtyFor(product);
    if (current > 1) {
        productQuantitySelection[product.id] = current - 1;
    }
};

const addToCart = (product: StoreProduct): void => {
    if (product.quantity <= 0) {
        return;
    }

    const requestedQty = Math.max(1, Math.min(selectedQtyFor(product), product.quantity));
    const existing = cart.value.find((item) => item.productId === product.id);

    if (existing) {
        existing.quantity = Math.min(existing.quantity + requestedQty, existing.stock);
    } else {
        cart.value.push({
            productId: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            image: product.image ?? null,
            quantity: requestedQty,
            stock: product.quantity,
        });
    }
};

const increaseCartQty = (productId: number): void => {
    const item = cart.value.find((entry) => entry.productId === productId);
    if (item && item.quantity < item.stock) {
        item.quantity += 1;
    }
};

const decreaseCartQty = (productId: number): void => {
    const item = cart.value.find((entry) => entry.productId === productId);
    if (!item) {
        return;
    }

    if (item.quantity > 1) {
        item.quantity -= 1;
    } else {
        cart.value = cart.value.filter((entry) => entry.productId !== productId);
    }
};

const removeFromCart = (productId: number): void => {
    cart.value = cart.value.filter((item) => item.productId !== productId);
};

const applyCartPayload = (items: unknown): void => {
    if (!Array.isArray(items)) {
        return;
    }

    const normalizedCart: CartItem[] = [];

    for (const rawItem of items) {
        if (!rawItem || typeof rawItem !== 'object') {
            continue;
        }

        const candidate = rawItem as Partial<CartItem>;
        const productId = Number(candidate.productId);
        const quantity = Number(candidate.quantity);
        const stock = Number(candidate.stock);
        if (!Number.isFinite(productId) || !Number.isFinite(quantity) || !Number.isFinite(stock) || stock <= 0) {
            continue;
        }

        normalizedCart.push({
            productId,
            name: String(candidate.name ?? ''),
            price: Number(candidate.price) || 0,
            image: candidate.image ?? null,
            quantity: Math.max(1, Math.min(Math.trunc(quantity), Math.trunc(stock))),
            stock: Math.max(0, Math.trunc(stock)),
        });
    }

    suppressCartSync.value = true;
    cart.value = normalizedCart;
    queueMicrotask(() => {
        suppressCartSync.value = false;
    });
};

const fetchCartFromServer = async (): Promise<void> => {
    try {
        const response = await axios.get(storeCartRoutes.index.url());
        applyCartPayload(response.data?.data ?? []);
    } catch (error) {
        console.error('Failed to load cart from server', error);
    } finally {
        cartLoadedFromServer.value = true;
    }
};

const syncCartToServer = async (): Promise<void> => {
    if (!cartLoadedFromServer.value || syncingCart.value) {
        return;
    }

    syncingCart.value = true;

    try {
        const response = await axios.put(storeCartRoutes.sync.url(), {
            items: cart.value.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        });

        applyCartPayload(response.data?.data ?? []);
    } catch (error) {
        console.error('Failed to sync cart to server', error);
    } finally {
        syncingCart.value = false;
    }
};

const syncCartWithProducts = (): void => {
    const nextCart = cart.value
        .map((item) => {
            const product = productById.value.get(item.productId);
            if (!product || product.quantity <= 0) {
                return null;
            }

            return {
                productId: item.productId,
                name: product.name,
                price: Number(product.price) || 0,
                image: product.image ?? null,
                quantity: Math.max(1, Math.min(item.quantity, product.quantity)),
                stock: product.quantity,
            };
        })
        .filter((item): item is CartItem => item !== null);

    const changed = JSON.stringify(nextCart) !== JSON.stringify(cart.value);
    if (!changed) {
        return;
    }

    suppressCartSync.value = true;
    cart.value = nextCart;
    queueMicrotask(() => {
        suppressCartSync.value = false;
    });
};

const scheduleCartSync = (): void => {
    if (!cartLoadedFromServer.value || suppressCartSync.value) {
        return;
    }

    if (cartSyncTimeout) {
        clearTimeout(cartSyncTimeout);
    }

    cartSyncTimeout = setTimeout(() => {
        void syncCartToServer();
    }, 250);
};

const resetCheckoutState = (): void => {
    checkoutForm.firstName = '';
    checkoutForm.lastName = '';
    checkoutForm.email = '';
    checkoutForm.phone = '';
    selectedPaymentMethod.value = 'Stripe';
    checkoutErrors.firstName = undefined;
    checkoutErrors.lastName = undefined;
    checkoutErrors.email = undefined;
    checkoutErrors.phone = undefined;
    showCheckoutErrors.value = false;
};

const checkoutDisabled = computed(() => {
    return cart.value.length === 0 || paymentStatus.value === 'processing';
});

const syncStripeStatusFromUrl = async (): Promise<void> => {
    const params = new URLSearchParams(window.location.search);
    const stripeFlag = params.get('stripe');
    const sessionId = params.get('session_id');

    if (!stripeFlag) {
        return;
    }

    // Clear query params so refresh doesn't re-trigger verification.
    const url = new URL(window.location.href);
    url.searchParams.delete('stripe');
    url.searchParams.delete('session_id');
    window.history.replaceState({}, '', url.toString());

    showCartPopup.value = true;

    if (stripeFlag === 'cancel') {
        paymentStatus.value = 'failed';
        paymentMessage.value = 'Checkout cancelled.';
        return;
    }

    if (stripeFlag === 'success' && sessionId) {
        paymentStatus.value = 'processing';
        paymentMessage.value = 'Confirming payment...';

        try {
            const response = await axios.get(stripeRoutes.checkoutSessionStatus.url(), {
                params: { session_id: sessionId },
            });

            const { paid, payment_status: paymentStatusFromProvider } = response.data as {
                paid?: boolean;
                payment_status?: string | null;
            };

            if (paid) {
                paymentStatus.value = 'success';
                paymentMessage.value = 'Payment successful. Cart cleared.';
                cart.value = [];
                resetCheckoutState();
            } else {
                paymentStatus.value = 'pending';
                paymentMessage.value = `Payment not confirmed yet (${paymentStatusFromProvider ?? 'unknown'}).`;
            }
        } catch (error) {
            console.error('Stripe verification failed', error);
            paymentStatus.value = 'failed';
            paymentMessage.value =
                getStripeErrorMessage(error) ?? 'Could not verify payment. Please try again.';
        }
    }
};

const payNow = async (): Promise<void> => {
    if (checkoutDisabled.value) {
        return;
    }

    showCheckoutErrors.value = true;

    const isValid = validateCheckoutForm();
    if (!isValid) {
        paymentStatus.value = 'failed';
        paymentMessage.value = 'Please fix the checkout errors below.';
        return;
    }

    paymentStatus.value = 'processing';
    paymentMessage.value = 'Creating Stripe checkout...';

    try {
        const response = await axios.post(stripeRoutes.checkoutSession.url(), {
            customer: { ...checkoutForm },
            items: cart.value.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
            })),
        });

        const { url } = response.data as { url?: string | null };
        if (!url) {
            throw new Error('Stripe checkout URL missing from response');
        }

        paymentMessage.value = 'Redirecting to Stripe...';
        window.location.href = url;
    } catch (error) {
        console.error('Stripe checkout creation failed', error);
        paymentStatus.value = 'failed';
        paymentMessage.value = getStripeErrorMessage(error) ?? 'Could not start Stripe checkout. Please try again.';
    }
};

onMounted(() => {
    void fetchCartFromServer();
    syncCartWithProducts();
    void syncStripeStatusFromUrl();
});

onBeforeUnmount(() => {
    if (cartSyncTimeout) {
        clearTimeout(cartSyncTimeout);
        cartSyncTimeout = null;
    }
});

watch(
    cart,
    () => {
        scheduleCartSync();
    },
    { deep: true },
);

watch(
    products,
    () => {
        syncCartWithProducts();
    },
    { deep: true },
);

const validateCheckoutForm = (): boolean => {
    checkoutErrors.firstName = undefined;
    checkoutErrors.lastName = undefined;
    checkoutErrors.email = undefined;
    checkoutErrors.phone = undefined;

    const firstName = checkoutForm.firstName.trim();
    const lastName = checkoutForm.lastName.trim();
    const email = checkoutForm.email.trim();
    const phone = checkoutForm.phone.trim();

    if (!firstName) {
        checkoutErrors.firstName = 'First name is required.';
    } else if (firstName.length > 100) {
        checkoutErrors.firstName = 'First name is too long.';
    }

    if (!lastName) {
        checkoutErrors.lastName = 'Last name is required.';
    } else if (lastName.length > 100) {
        checkoutErrors.lastName = 'Last name is too long.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        checkoutErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
        checkoutErrors.email = 'Email format is not valid.';
    }

    // Accept digits with optional leading +, plus spaces/dashes; require at least 7 digits total.
    const digitsOnly = phone.replace(/\D/g, '');
    const phoneRegex = /^\+?[0-9\s-]{7,}$/;
    if (!phone) {
        checkoutErrors.phone = 'Phone is required.';
    } else if (!phoneRegex.test(phone) || digitsOnly.length < 7) {
        checkoutErrors.phone = 'Phone format is not valid.';
    }

    return !checkoutErrors.firstName && !checkoutErrors.lastName && !checkoutErrors.email && !checkoutErrors.phone;
};

watch(
    () => [checkoutForm.firstName, checkoutForm.lastName, checkoutForm.email, checkoutForm.phone],
    () => {
        if (!showCheckoutErrors.value) {
            return;
        }

        const isValid = validateCheckoutForm();
        if (isValid) {
            paymentStatus.value = 'idle';
            paymentMessage.value = '';
        }
    },
);
</script>

<template>
    <div class="h-full w-full rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-950">
        <div class="mb-6 flex items-end justify-between">
            <div>
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Store</p>
                <h2 class="text-2xl font-semibold text-zinc-900 dark:text-white">Products</h2>
            </div>
            <button
                type="button"
                class="relative rounded-xl cursor-pointer bg-zinc-900 px-2 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                @click="showCartPopup = true"
            >
                <ShoppingCart class="" />
                <span
                    class="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-zinc-200 px-1 text-xs font-bold text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                >
                    {{ cartItemCount }}
                </span>
            </button>
        </div>

        <div>
            <section>
                <div
                    v-if="products.length === 0"
                    class="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                    No products database yet.
                </div>
                <div v-else class="grid grid-cols-3 gap-4">
                    <article
                        v-for="product in products"
                        :key="product.id"
                        class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
                    >
                        <img
                            :src="product.image || 'https://via.placeholder.com/600x380?text=No+Image'"
                            :alt="product.name"
                            class="mb-4 h-40 w-full rounded-lg object-cover"
                        />
                        <div class="mb-2 flex items-center justify-between gap-2">
                            <h4 class="text-lg font-semibold text-zinc-900 dark:text-white">
                                {{ product.name }}
                            </h4>
                            <span
                                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                                :class="product.quantity > 0
                                    ? 'bg-zinc-900 text-white dark:bg-zinc-200 dark:text-zinc-900'
                                    : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'"
                            >
                                {{ product.quantity > 0 ? `${product.quantity} available` : 'Out of stock' }}
                            </span>
                        </div>
                        <p class="mb-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {{ product.description }}
                        </p>

                        <div class="mb-3 flex items-center justify-between">
                            <p class="text-xl font-bold text-zinc-900 dark:text-white">
                                {{ formatPrice(product.price) }}
                            </p>
                            <div class="flex items-center gap-2">
                                <button
                                    type="button"
                                    class="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                                    :disabled="selectedQtyFor(product) <= 1"
                                    @click="decreaseSelectedQty(product)"
                                >
                                    -
                                </button>
                                <span class="w-6 text-center text-sm font-medium text-zinc-800 dark:text-zinc-200">{{ selectedQtyFor(product) }}</span>
                                <button
                                    type="button"
                                    class="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                                    :disabled="selectedQtyFor(product) >= product.quantity"
                                    @click="increaseSelectedQty(product)"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <button
                            type="button"
                            class="w-full rounded-xl cursor-pointer bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                            :disabled="product.quantity <= 0"
                            @click="addToCart(product)"
                        >
                            Add to cart
                        </button>
                    </article>
                </div>
            </section>
        </div>

        <div
            v-if="showCartPopup"
            class="fixed inset-0 z-50 flex items-start justify-end bg-black/40 p-4"
            @click.self="showCartPopup = false"
        >
            <section class="max-h-[95vh] w-full max-w-md overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-950">
                <div class="mb-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-zinc-900 dark:text-white">Cart & Checkout</h3>
                    <button
                        type="button"
                        class="rounded-lg cursor-pointer border border-zinc-300 px-2 py-1 text-xs text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                        @click="showCartPopup = false"
                    >
                        Close
                    </button>
                </div>

                <div class="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                    <h4 class="mb-3 text-base font-semibold text-zinc-900 dark:text-white">Cart</h4>
                    <div v-if="cart.length === 0" class="text-sm text-zinc-500 dark:text-zinc-400">
                        Your cart is empty.
                    </div>
                    <div v-else class="space-y-3">
                        <div
                            v-for="item in cart"
                            :key="item.productId"
                            class="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-950"
                        >
                            <div class="mb-2 flex items-start justify-between gap-2">
                                <p class="text-sm font-semibold text-zinc-900 dark:text-white">{{ item.name }}</p>
                                <button
                                    type="button"
                                    class="text-xs cursor-pointer font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                                    @click="removeFromCart(item.productId)"
                                >
                                    Remove
                                </button>
                            </div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <button
                                        type="button"
                                        class="rounded cursor-pointer border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700"
                                        @click="decreaseCartQty(item.productId)"
                                    >
                                        -
                                    </button>
                                    <span class="min-w-6 text-center text-sm">{{ item.quantity }}</span>
                                    <button
                                        type="button"
                                        class="rounded cursor-pointer border border-zinc-300 px-2 py-0.5 text-xs dark:border-zinc-700"
                                        :disabled="item.quantity >= item.stock"
                                        @click="increaseCartQty(item.productId)"
                                    >
                                        +
                                    </button>
                                </div>
                                <span class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                    {{ formatPrice(item.price * item.quantity) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900">
                    <h4 class="mb-3 text-base font-semibold text-zinc-900 dark:text-white">Checkout</h4>
                    <div class="grid gap-2">
                        <div>
                            <input
                                v-model="checkoutForm.firstName"
                                type="text"
                                placeholder="First name"
                                :class="[
                                    'rounded-xl border bg-white px-3 py-2 text-sm dark:bg-zinc-950 w-full',
                                    showCheckoutErrors && checkoutErrors.firstName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-400'
                                        : 'border-zinc-300 dark:border-zinc-700',
                                ]"
                            />
                            <p
                                v-if="showCheckoutErrors && checkoutErrors.firstName"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ checkoutErrors.firstName }}
                            </p>
                        </div>

                        <div>
                            <input
                                v-model="checkoutForm.lastName"
                                type="text"
                                placeholder="Last name"
                                :class="[
                                    'rounded-xl border bg-white px-3 py-2 text-sm dark:bg-zinc-950 w-full',
                                    showCheckoutErrors && checkoutErrors.lastName
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-400'
                                        : 'border-zinc-300 dark:border-zinc-700',
                                ]"
                            />
                            <p
                                v-if="showCheckoutErrors && checkoutErrors.lastName"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ checkoutErrors.lastName }}
                            </p>
                        </div>

                        <div>
                            <input
                                v-model="checkoutForm.email"
                                type="email"
                                placeholder="Email"
                                :class="[
                                    'rounded-xl border bg-white px-3 py-2 text-sm dark:bg-zinc-950 w-full',
                                    showCheckoutErrors && checkoutErrors.email
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-400'
                                        : 'border-zinc-300 dark:border-zinc-700',
                                ]"
                            />
                            <p
                                v-if="showCheckoutErrors && checkoutErrors.email"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ checkoutErrors.email }}
                            </p>
                        </div>

                        <div>
                            <input
                                v-model="checkoutForm.phone"
                                type="text"
                                placeholder="Phone"
                                :class="[
                                    'rounded-xl border bg-white px-3 py-2 text-sm dark:bg-zinc-950 w-full',
                                    showCheckoutErrors && checkoutErrors.phone
                                        ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-red-400'
                                        : 'border-zinc-300 dark:border-zinc-700',
                                ]"
                            />
                            <p
                                v-if="showCheckoutErrors && checkoutErrors.phone"
                                class="mt-1 text-xs text-red-600 dark:text-red-400"
                            >
                                {{ checkoutErrors.phone }}
                            </p>
                        </div>
                    </div>

                    <div class="mt-3 rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-700 dark:bg-zinc-950">
                        <div class="mb-2 flex items-center justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Payment method</span>
                            <span class="font-semibold text-zinc-900 dark:text-zinc-100">{{ selectedPaymentMethod }}</span>
                        </div>
                        <div class="mb-1 flex items-center justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">Subtotal</span>
                            <span>{{ formatPrice(subtotal) }}</span>
                        </div>
                        <div class="mb-1 flex items-center justify-between">
                            <span class="text-zinc-500 dark:text-zinc-400">VAT (22%)</span>
                            <span>{{ formatPrice(vat) }}</span>
                        </div>
                        <div class="flex items-center justify-between border-t border-zinc-200 pt-2 font-semibold dark:border-zinc-700">
                            <span>Total</span>
                            <span>{{ formatPrice(total) }}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        class="mt-4 w-full cursor-pointer rounded-xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        :disabled="checkoutDisabled"
                        @click="payNow"
                    >
                        {{ paymentStatus === 'processing' ? 'Processing...' : 'Checkout' }}
                    </button>

                    <p
                        v-if="paymentStatus !== 'idle'"
                        class="mt-3 rounded-lg border px-3 py-2 text-sm"
                        :class="{
                            'border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100': paymentStatus === 'processing' || paymentStatus === 'pending',
                            'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300': paymentStatus === 'success',
                            'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300': paymentStatus === 'failed',
                        }"
                    >
                        {{ paymentMessage }}
                    </p>
                </div>
            </section>
        </div>
    </div>
</template>