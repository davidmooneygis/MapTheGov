import { initMap, loadBoundaries } from './map.js';

document.addEventListener('DOMContentLoaded', () => {
    const map = initMap();

    // Load federal boundaries automatically
    loadBoundaries('federal', map);
});