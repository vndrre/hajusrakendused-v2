<script setup lang="ts">
import { usePage } from '@inertiajs/vue3';
import axios from 'axios';
import L from 'leaflet';
import markersRoutes from '@/routes/markers';
import markersApiRoutes from '@/routes/markers/api';
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png';

interface Marker {
    id: number;
    name: string;
    latitude: number | string;
    longitude: number | string;
    description?: string;
    added: string;
    edited?: string;
}

const mapContainer = ref<HTMLElement>();
const map = ref<any>();
const markers = ref<Marker[]>([]);
const showForm = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const editingMarkerId = ref<number | null>(null);
const saving = ref(false);
const newMarker = ref({
    name: '',
    latitude: 0,
    longitude: 0,
    description: '',
});

const mapMarkers = ref<any[]>([]);

const MARKERS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2xUrl,
    iconUrl: markerIconUrl,
    shadowUrl: markerShadowUrl,
});
const page = usePage<{
    auth?: { user?: { id?: number } };
}>();

const authUserId = page.props.auth?.user?.id ?? null;
const MARKERS_CACHE_KEY = authUserId
    ? `map_markers_cache_v1_user_${authUserId}`
    : 'map_markers_cache_v1_guest';

interface MarkersCachePayload {
    savedAt: number;
    markers: Marker[];
}

const readMarkersCachePayload = (): MarkersCachePayload | null => {
    if (typeof window === 'undefined') return null;

    try {
        const raw = window.localStorage.getItem(MARKERS_CACHE_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as MarkersCachePayload;
        if (!parsed || typeof parsed.savedAt !== 'number' || !Array.isArray(parsed.markers)) return null;

        return parsed;
    } catch {
        return null;
    }
};

const loadMarkersFromCache = (): Marker[] | null => {
    const payload = readMarkersCachePayload();
    if (!payload) return null;

    const isFresh = Date.now() - payload.savedAt < MARKERS_CACHE_TTL_MS;
    return isFresh ? payload.markers : null;
};

const saveMarkersToCache = (markersToSave: Marker[]): void => {
    if (typeof window === 'undefined') return;

    const payload: MarkersCachePayload = {
        savedAt: Date.now(),
        markers: markersToSave,
    };

    try {
        window.localStorage.setItem(MARKERS_CACHE_KEY, JSON.stringify(payload));
    } catch {
        // Ignore localStorage failures (quota/private mode). Map still works via API.
    }
};
const parseCoordinate = (value: number | string | null | undefined): number | null => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === 'string') {
        // Accept both "59.123" and "59,123" inputs.
        const normalized = value.trim().replace(',', '.');
        if (normalized.length === 0) {
            return null;
        }

        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
};

const formatCoordinate = (value: number | string): string => {
    const parsed = parseCoordinate(value);
    return parsed === null ? '—' : parsed.toFixed(6);
};

const escapeHtml = (value: string): string => {
    // Minimal escaping for marker popups.
    return value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '\'':
                return '&#039;';
            default:
                return char;
        }
    });
};

const initMap = async () => {
    if (!mapContainer.value) {
        return;
    }

    try {
        // Start at the global view; user can pan/zoom freely anywhere.
        map.value = L.map(mapContainer.value).setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map.value);

        map.value.on('click', (event: any) => {
            if (event.latlng) {
                showMarkerForm(event.latlng.lat, event.latlng.lng);
            }
        });

        setTimeout(() => {
            map.value?.invalidateSize();
        }, 0);

        await loadMarkers();
    } catch (error) {
        console.error('Error initializing map:', error);
    }
};

const loadMarkers = async () => {
    try {
        const cachedMarkers = loadMarkersFromCache();
        if (cachedMarkers) {
            markers.value = cachedMarkers;
            updateMapMarkers();
        }

        const response = await axios.get(markersApiRoutes.index.url());
        markers.value = response.data;
        updateMapMarkers();

        saveMarkersToCache(markers.value);
    } catch (error) {
        console.error('Error loading markers:', error);
    }
};

const updateMapMarkers = () => {
    // Clear existing markers from the map
    mapMarkers.value.forEach((markerInstance) => {
        try {
            markerInstance.remove();
        } catch {
            if (map.value) {
                map.value.removeLayer(markerInstance);
            }
        }
    });
    mapMarkers.value = [];

    if (!map.value || !L) {
        return;
    }

    const validLatLngs: Array<[number, number]> = [];

    // Add new markers
    markers.value.forEach((marker) => {
        const latitude = parseCoordinate(marker.latitude);
        const longitude = parseCoordinate(marker.longitude);

        if (latitude === null || longitude === null) {
            // Avoid silently plotting at (0,0); just skip invalid records.
            console.warn('Skipping marker with invalid coordinates', marker);
            return;
        }

        validLatLngs.push([latitude, longitude]);

        const leafletMarker = L.marker([latitude, longitude])
            .addTo(map.value)
            .bindPopup(
                `
                <div style="max-width: 260px">
                    <div style="font-weight: 700; margin-bottom: 4px">${escapeHtml(marker.name)}</div>
                    <div style="font-size: 12px; opacity: .8; margin-bottom: 8px">${latitude.toFixed(6)}, ${longitude.toFixed(6)}</div>
                    ${
                        marker.description
                            ? `<div style="font-size: 12px; margin-bottom: 10px">${escapeHtml(
                                  marker.description,
                              )}</div>`
                            : ''
                    }
                    <div style="display:flex; gap:8px">
                        <button type="button" data-action="edit" data-marker-id="${marker.id}" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #111827; background:#111827; color:white; cursor:pointer">Edit</button>
                        <button type="button" data-action="delete" data-marker-id="${marker.id}" style="flex:1; padding:6px 8px; border-radius:8px; border:1px solid #111827; background:#000000; color:white; cursor:pointer">Delete</button>
                    </div>
                </div>
            `,
            );

        mapMarkers.value.push(leafletMarker);

        leafletMarker.on('popupopen', (event: any) => {
            const popupEl = event?.popup?.getElement?.() as HTMLElement | null;
            if (!popupEl) return;

            const editBtn = popupEl.querySelector('button[data-action="edit"]') as HTMLButtonElement | null;
            const deleteBtn = popupEl.querySelector('button[data-action="delete"]') as HTMLButtonElement | null;

            editBtn?.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                editMarker(marker);
                event?.popup?.remove?.();
            });

            deleteBtn?.addEventListener('click', (e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                openDeleteModal(marker);
                event?.popup?.remove?.();
            });
        });
    });

    // Fit map to markers when possible so markers appear in correct positions.
    if (validLatLngs.length > 0) {
        const bounds = L.latLngBounds(validLatLngs);
        if (bounds.isValid()) {
            map.value.fitBounds(bounds, { padding: [24, 24] });
        }
    }

    // Leaflet can misplace markers if the container resized (e.g. when form opens).
    setTimeout(() => {
        map.value?.invalidateSize();
    }, 0);
};

const showMarkerForm = (lat: number, lng: number) => {
    formMode.value = 'create';
    editingMarkerId.value = null;

    newMarker.value = {
        name: '',
        latitude: lat,
        longitude: lng,
        description: '',
    };
    showForm.value = true;
};

const saveMarker = async () => {
    saving.value = true;
    try {
        if (formMode.value === 'edit' && editingMarkerId.value !== null) {
            const response = await axios.put(markersRoutes.update.url(editingMarkerId.value), newMarker.value);

            markers.value = markers.value.map((existing) => {
                if (existing.id !== response.data.id) {
                    return existing;
                }

                return response.data;
            });
        } else {
            const response = await axios.post(markersRoutes.store.url(), newMarker.value);
            markers.value.push(response.data);
        }

        updateMapMarkers();
        saveMarkersToCache(markers.value);
        showForm.value = false;
        formMode.value = 'create';
        editingMarkerId.value = null;
        newMarker.value = { name: '', latitude: 0, longitude: 0, description: '' };
    } catch (error) {
        console.error('Error saving marker:', error);
        alert('Error saving marker');
    } finally {
        saving.value = false;
    }
};

const cancelForm = () => {
    showForm.value = false;
    formMode.value = 'create';
    editingMarkerId.value = null;
    newMarker.value = { name: '', latitude: 0, longitude: 0, description: '' };
};

const editMarker = (marker: Marker) => {
    formMode.value = 'edit';
    editingMarkerId.value = marker.id;

    const latitude = parseCoordinate(marker.latitude);
    const longitude = parseCoordinate(marker.longitude);

    newMarker.value = {
        name: marker.name,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        description: marker.description || '',
    };
    showForm.value = true;
};

const deleteModalOpen = ref(false);
const deleteTargetMarker = ref<Marker | null>(null);
const deleteSubmitting = ref(false);
const deleteErrorMessage = ref<string | null>(null);

const openDeleteModal = (marker: Marker): void => {
    deleteTargetMarker.value = marker;
    deleteErrorMessage.value = null;
    deleteModalOpen.value = true;
};

const closeDeleteModal = (): void => {
    deleteModalOpen.value = false;
    deleteTargetMarker.value = null;
    deleteErrorMessage.value = null;
    deleteSubmitting.value = false;
};

const confirmDeleteMarker = async (): Promise<void> => {
    if (!deleteTargetMarker.value) {
        return;
    }

    deleteSubmitting.value = true;
    try {
        await axios.delete(markersRoutes.destroy.url(deleteTargetMarker.value.id));
        markers.value = markers.value.filter((m) => m.id !== deleteTargetMarker.value?.id);
        updateMapMarkers();
        saveMarkersToCache(markers.value);
        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting marker:', error);
        deleteErrorMessage.value = 'Viga markeri kustutamisel';
    } finally {
        deleteSubmitting.value = false;
    }
};

onMounted(() => {
    nextTick(() => {
        initMap();
    });
});

onBeforeUnmount(() => {
    if (map.value) {
        map.value.remove();
        map.value = null;
    }
});

// Leaflet needs invalidateSize when layout changes (this component grows/shrinks
// when `showForm` toggles).
watch(showForm, () => {
    nextTick(() => {
        map.value?.invalidateSize?.();
    });
});
</script>

<template>
    <div class="rounded-3xl p-6 shadow-xl h-full w-full">
        <h2 class="mb-4 text-2xl font-semibold text-zinc-900 dark:text-white">
            Map Widget
        </h2>


        <div class="grid gap-4 xl:grid-cols-3 h-full w-full">
            <!-- Map Container -->
            <div class="mb-4 w-full xl:col-span-2">
                <div
                    ref="mapContainer"
                    class="h-full w-full rounded-2xl border border-zinc-300 dark:border-zinc-700"
                ></div>
            </div>
            <!-- Marker Form -->
            <div
                v-if="showForm"
                class="mb-4 w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900"
            >
                <h3 class="mb-3 text-lg font-medium text-zinc-900 dark:text-white">
                    {{ formMode === 'edit' ? 'Edit marker' : 'Add new marker' }}
                </h3>
                <form @submit.prevent="saveMarker" class="space-y-3">
                    <div>
                        <label
                            class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Name
                        </label>
                        <input
                            v-model="newMarker.name"
                            type="text"
                            required
                            class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-zinc-500"
                            placeholder="Marker name"
                        />
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label
                                class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Latitude
                            </label>
                            <input
                                v-model.number="newMarker.latitude"
                                type="number"
                                step="any"
                                required
                                min="-90"
                                max="90"
                                class="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                            />
                        </div>
                        <div>
                            <label
                                class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                Longitude
                            </label>
                            <input
                                v-model.number="newMarker.longitude"
                                type="number"
                                step="any"
                                required
                                min="-180"
                                max="180"
                                class="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                            />
                        </div>
                    </div>
                    <div>
                        <label
                            class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                        >
                            Description
                        </label>
                        <textarea
                            v-model="newMarker.description"
                            rows="3"
                            class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:focus:ring-zinc-500"
                            placeholder="Optional description"
                        ></textarea>
                    </div>
                    <div class="flex gap-2">
                        <button
                            type="submit"
                            :disabled="saving"
                            class="rounded-xl bg-zinc-900 px-4 py-2 text-white transition hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                            {{ saving ? 'Saving...' : formMode === 'edit' ? 'Update' : 'Save' }}
                        </button>
                        <button
                            type="button"
                            @click="cancelForm"
                            class="rounded-xl bg-zinc-600 px-4 py-2 text-white transition hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <!-- Markers List -->
                <div v-if="markers.length > 0" class="w-full space-y-2 mt-10">
                    <h3 class="text-lg font-medium text-zinc-900 dark:text-white">
                        Markers
                    </h3>
                <div class="space-y-2">
                        <div
                            v-for="marker in markers"
                            :key="marker.id"
                            class="rounded-xl border border-zinc-200 bg-zinc-50 p-3 mx-2 dark:border-zinc-700 dark:bg-zinc-900"
                        >
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <h4
                                        class="font-medium text-zinc-900 dark:text-white"
                                    >
                                        {{ marker.name }}
                                    </h4>
                                    <p class="text-sm text-zinc-600 dark:text-zinc-400">
                                        {{ formatCoordinate(marker.latitude) }},
                                        {{ formatCoordinate(marker.longitude) }}
                                    </p>
                                    <p
                                        v-if="marker.description"
                                        class="mt-1 text-sm text-zinc-700 dark:text-zinc-300"
                                    >
                                        {{ marker.description }}
                                    </p>
                                </div>
                                <div class="ml-2 flex gap-1">
                                    <button
                                        @click="editMarker(marker)"
                                        class="rounded bg-zinc-700 px-2 py-1 text-xs text-white transition hover:bg-zinc-900 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        @click="openDeleteModal(marker)"
                                        class="rounded bg-black px-2 py-1 text-xs text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-300"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div> 

            </div>


        </div>
    </div>

    <!-- Delete confirmation modal (UI popup, not browser confirm()) -->
    <div
        v-if="deleteModalOpen"
        class="fixed inset-0 z-[10000] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
    >
        <div
            class="absolute inset-0 z-[10000] bg-black/60"
            @click="closeDeleteModal"
        ></div>

        <div class="relative z-[10001] w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h3 class="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                Delete marker
            </h3>

            <p class="text-sm text-zinc-700 dark:text-zinc-300">
                Are you sure you want to delete
                <span class="font-semibold">{{ deleteTargetMarker?.name }}</span>?
            </p>

            <div v-if="deleteTargetMarker" class="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800">
                <div class="text-zinc-800 dark:text-zinc-200">
                    {{ formatCoordinate(deleteTargetMarker.latitude) }},
                    {{ formatCoordinate(deleteTargetMarker.longitude) }}
                </div>
                <div v-if="deleteTargetMarker.description" class="mt-1 text-zinc-600 dark:text-zinc-300">
                    {{ deleteTargetMarker.description }}
                </div>
            </div>

            <p
                v-if="deleteErrorMessage"
                class="mt-3 text-sm font-medium text-red-600 dark:text-red-400"
            >
                {{ deleteErrorMessage }}
            </p>

            <div class="mt-5 flex gap-2">
                <button
                    type="button"
                    @click="closeDeleteModal"
                    :disabled="deleteSubmitting"
                    class="flex-1 rounded-xl bg-zinc-200 px-4 py-2 text-zinc-900 transition hover:bg-zinc-300 disabled:opacity-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    @click="confirmDeleteMarker"
                    :disabled="deleteSubmitting"
                    class="flex-1 rounded-xl bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                    {{ deleteSubmitting ? 'Deleting...' : 'Delete' }}
                </button>
            </div>
        </div>
    </div>
</template>
