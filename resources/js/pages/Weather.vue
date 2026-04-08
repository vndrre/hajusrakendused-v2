<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import WeatherWidget from '@/components/WeatherWidget.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Weather',
        href: '/weather',
    },
];
</script>

<template>
    <Head title="Weather" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-1 flex-col gap-4 rounded-xl p-4">
            <WeatherWidget />
        </div>
    </AppLayout>
</template>
