import { initMap, loadAllProvinces, updateVisibleProvinces, displayRidingInfo } from './map.js';

window.showRidings = true;
let provinceLayers = {};
let mapInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    mapInstance = initMap();

    // Wait for layers to load
    provinceLayers = await loadAllProvinces();
    window.provinceLayers = provinceLayers;
    window.mapInstance = mapInstance;

    // Show ridings initially
    updateVisibleProvinces(mapInstance, provinceLayers);

    // Toggle button handler
    const toggleBtn = document.getElementById('toggle-ridings');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            window.showRidings = !window.showRidings;
            toggleBtn.textContent = window.showRidings ? 'Hide Federal Ridings' : 'Show Federal Ridings';
            updateVisibleProvinces(mapInstance, provinceLayers);
        });
    }

    // Re-evaluate on move/end (debounced)
    let debounceTimer;
    mapInstance.on('moveend', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            if (window.showRidings) {
                updateVisibleProvinces(mapInstance, provinceLayers);
            }
        }, 300);
    });
});