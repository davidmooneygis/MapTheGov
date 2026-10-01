// This function will load boundaries for any level: 'federal', 'provincial', 'municipal'
export function loadBoundaries(level, mapInstance) {
    const url = `/data/processed/${level}.geojson`;
    console.log(`Fetching: ${url}`);

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${level} data`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`Data received for ${level}`);

           // Create the riding layer
            const layer = L.geoJSON(data, {
                style: {
                    color: "#6d4aff",
                    weight: 3,
                    opacity: 1.0,
                    fillColor: "#6d4aff",
                    fillOpacity: 0.2
                },
                onEachFeature: function(feature, layer) {
                    let name = "Unknown";
                    if (feature.properties) {
                        name = feature.properties.PRNAME || feature.properties.FED_NAME || feature.properties.NAME || feature.properties.PRUID || "Unknown";
                    }
                    layer.bindPopup(`<b>${level}: ${name}</b>`);
                }
            });

            // ADD TO MAP and bring to front
            layer.addTo(mapInstance);
            layer.bringToFront();

            console.log(`${level} ridings drawn on map.`);
        })
        .catch(error => {
            console.error(`Error loading ${level}:`, error);
        });
}

/**
 * Initializes the map and centers on the user's location.
 * @returns {L.Map} The Leaflet map instance.
 */
export function initMap() {
    // 1. Create the map (start zoomed out to see the whole country)
    const map = L.map('map').setView([56.1304, -106.3468], 5);

    // 2. Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Try to get the user's location
    if ("geolocation" in navigator) {
        map.locate({ setView: true, maxZoom: 16 });
    } else {
        alert("Geolocation is not supported by this browser.");
    }

    // 4. Handle successful location find
    map.on('locationfound', (e) => {
        const radius = e.accuracy;
        L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius + " meters from this point").openPopup();
        L.circle(e.latlng, radius).addTo(map);
    });

    // 5. Handle location error
    map.on('locationerror', (e) => {
        console.warn("Location access denied or failed:", e.message);
        // Fallback to a default location if geolocation fails
        map.setView([56.1304, -106.3468], 5);
    });

    console.log("Map initialized with location tracking.");
    return map;
}