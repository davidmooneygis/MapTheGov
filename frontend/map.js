const PROVINCE_MAP = {
    '10': 'NL', '11': 'NS', '12': 'PE', '13': 'NB',
    '24': 'QC', '35': 'ON', '46': 'MB', '47': 'SK',
    '48': 'AB', '59': 'BC', '60': 'YT', '61': 'NT', '62': 'NU'
};

export async function loadAllProvinces() {
    const layers = {};

    for (const provCode of Object.keys(PROVINCE_MAP)) {
        const provAbbr = PROVINCE_MAP[provCode];
        const url = `/data/processed/by_province/federal_${provAbbr}.geojson`;

        try {
            const response = await fetch(url);
            if (!response.ok) continue;

            const data = await response.json();
            const layer = L.geoJSON(data, {
                style: { color: "#6d4aff", weight: 2, opacity: 0.8, fillColor: "#6d4aff", fillOpacity: 0.2 },
                onEachFeature: function(feature, lyr) {
                    lyr.on('click', (e) => {
                        e.originalEvent.stopPropagation();
                        displayRidingInfo(feature);
                    });
                }
            });
            layers[provAbbr] = layer;
        } catch (error) {
            console.warn(`Could not load ${provAbbr}`);
        }
    }

    return layers;
}

export function updateVisibleProvinces(map, layers) {
    const bounds = map.getBounds();
    const center = map.getCenter();

    // Calculate which provinces are roughly in view based on lat/lon ranges
    const provinceBounds = {
        'NL': [-47.9, 47.4, -52.9, 52.0],
        'NS': [-61.4, 43.1, -66.3, 47.1],
        'PE': [-62.4, 45.9, -64.1, 47.4],
        'NB': [-64.8, 44.6, -69.1, 48.2],
        'QC': [-61.2, 45.0, -79.8, 62.5],
        'ON': [-74.2, 41.6, -95.2, 56.9],
        'MB': [-89.9, 49.0, -102.0, 60.2],
        'SK': [-101.4, 49.0, -110.0, 60.2],
        'AB': [-110.0, 49.0, -120.1, 60.1],
        'BC': [-114.7, 48.3, -139.1, 60.3],
        'YT': [-125.5, 60.8, -141.0, 69.6],
        'NT': [-118.0, 59.8, -135.0, 72.0],
        'NU': [-70.0, 60.0, -115.0, 83.1]
    };

    // Detect which provinces overlap with current view
    for (const [prov, [minLon, minLat, maxLon, maxLat]] of Object.entries(provinceBounds)) {
        if (layers[prov]) {
            const inView = center.lng >= maxLon && center.lng <= minLon &&
                          center.lat >= minLat && center.lat <= maxLat;
            if (window.showRidings && inView) {
                map.addLayer(layers[prov]);
            } else {
                map.removeLayer(layers[prov]);
            }
        }
    }
}

export function displayRidingInfo(feature) {
    const props = feature.properties || {};
    console.log('Available fields:', Object.keys(props));
    console.log('Full properties:', props);

    let popupEl = document.querySelector('.riding-popup');
    if (!popupEl) {
        popupEl = document.createElement('div');
        popupEl.className = 'riding-popup';
        popupEl.innerHTML = `
            <button class="close-btn">×</button>
            <div class="riding-info"></div>
        `;
        document.body.appendChild(popupEl);

        popupEl.querySelector('.close-btn').addEventListener('click', () => {
            popupEl.classList.remove('active');
        });
    }

    const infoContainer = popupEl.querySelector('.riding-info');
    infoContainer.innerHTML = `
        <h3>${'Federal Riding'|| 'Unknown Riding'}</h3>
        <p class="riding-name-fr">${props.ED_NAMEF ? `<em>${props.ED_NAMEF}</em>` : ''}</p>
        <div class="info-grid">
            <div class="info-item">
                <strong>Election Year:</strong>
                <span>${props.REP_ORDER || 'N/A'}</span>
            </div>
            ${props.DEC_REP ? `
            <div class="info-item">
                <strong>Report Dec:</strong>
                <span>${props.DEC_REP}</span>
            </div>
            ` : ''}
            ${props.SHAPE_AREA ? `
            <div class="info-item">
                <strong>Area:</strong>
                <span>${Math.round(props.SHAPE_AREA / 1000000).toLocaleString()} km²</span>
            </div>
            ` : ''}
            ${props.ELCT_CNT ? `
            <div class="info-item">
                <strong>Electors:</strong>
                <span>${props.ELCT_CNT.toLocaleString()}</span>
            </div>
            ` : ''}
        </div>
    `;

    popupEl.classList.add('active');
}

export function initMap() {
    const map = L.map('map').setView([56.1304, -106.3468], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if ("geolocation" in navigator) {
        map.locate({ setView: false });
    }

    map.on('locationfound', (e) => {
        L.marker(e.latlng).addTo(map).bindPopup(`You are within ${e.accuracy} meters`).openPopup();
    });

    return map;
}