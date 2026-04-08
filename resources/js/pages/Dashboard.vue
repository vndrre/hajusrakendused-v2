<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import AppLayout from '@/layouts/AppLayout.vue';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
    },
];
</script>

<template>
    <Head title="Dashboard" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div
            class="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4"
        >
            <div class="flex flex-col justify-center items-center gap-4 h-full w-full">
                <h1 class="text-6xl font-bold text-center">
                    Welcome to my application!
                </h1>
                <p class="text-2xl text-center text-gray-500">
                    Navigate through the application using the sidebar.
                </p>
            </div>
        </div>
    </AppLayout>
</template>
