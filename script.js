const map = L.map('map')
  .setView([12.8797, 121.7740], 6);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

const markerLayer = L.layerGroup().addTo(map);

const form = document.getElementById('searchForm');
const input = document.getElementById('cityInput');
const statusEl = document.getElementById('status');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const city = input.value.trim();
  if (city.length < 2) return;
  markerLayer.clearLayers();
  statusEl.textContent = '';

  const url =
    'https://geocoding-api.open-meteo.com/v1/search?' +
    new URLSearchParams({
      name: city,
      count: '5',
      language: 'en',
      format: 'json',
      countryCode: 'PH' //Search for a Philippine city
    });

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    const locations = data.results ?? [];

    // Display a useful message for no results
    if (locations.length === 0) {
      statusEl.textContent = 'No matching locations found.';
      return;
    }

    const bounds = [];
    locations.forEach((place) => {
      const coords = [place.latitude, place.longitude];
      bounds.push(coords);
      L.marker(coords).addTo(markerLayer)
        //Include the place name and country in each popup
        .bindPopup(place.name + ', ' + place.country);
    });

    if (bounds.length === 1) map.setView(bounds[0], 11);
    else if (bounds.length > 1)
      map.fitBounds(bounds, { padding: [35, 35] });
  } catch (error) {
    // Display a useful message for errors
    statusEl.textContent = 'Error fetching locations. Please try again.';
  }
});