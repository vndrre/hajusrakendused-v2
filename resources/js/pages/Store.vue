<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import StoreWidget from '@/components/StoreWidget.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';

interface StoreProduct {
    id: number;
    name: string;
    description: string;
    price: number | string;
    image?: string | null;
    quantity: number;
}

defineProps<{
    products: StoreProduct[];
}>();

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Store',
        href: '/store',
    },
];
</script>

<template>
    <Head title="Store" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-1 flex-col gap-4 rounded-xl p-4">
            <StoreWidget :products="products" />
        </div>
    </AppLayout>
</template>
