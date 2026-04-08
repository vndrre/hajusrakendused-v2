<script setup lang="ts">
import { Head } from '@inertiajs/vue3';
import MapWidget from '@/components/MapWidget.vue';
import AppLayout from '@/layouts/AppLayout.vue';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Map',
        href: '/map',
    },
];
</script>

<template>
    <Head title="Map" />

    <AppLayout :breadcrumbs="breadcrumbs">
        <div class="flex flex-1 flex-col gap-4 rounded-xl p-4">
            <MapWidget />
        </div>
    </AppLayout>
</template>
