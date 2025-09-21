// Initialize map
var map = L.map('map').setView([10.3157, 123.8854], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

var control = null;
var startMarker = null;
var endMarker = null;

// Debounce helper
function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args), delay);
    };
}

// OpenStreetMap Provider
const provider = new window.GeoSearch.OpenStreetMapProvider();

// Autocomplete setup
function setupAutocomplete(inputId, markerType) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(inputId + "-suggestions");
    let selectedIndex = -1;

    input.addEventListener("input", debounce(async function() {
        if (!input.value) {
            dropdown.innerHTML = "";
            return;
        }

        const results = await provider.search({ query: input.value });
        dropdown.innerHTML = "";
        selectedIndex = -1;

        // Filter suggestions containing "Cebu"
        const filtered = results.filter(r => r.label.includes("Cebu")).slice(0, 5);

        filtered.forEach(result => {
            const option = document.createElement("div");
            option.className = "suggestion-item";
            option.textContent = result.label;

            option.addEventListener("click", () => {
                input.value = result.label;
                dropdown.innerHTML = "";
                input.dataset.lat = result.y;
                input.dataset.lng = result.x;

                map.setView([result.y, result.x], 14);

                if (markerType === "start") {
                    if (startMarker) startMarker.setLatLng([result.y, result.x]);
                    else startMarker = L.marker([result.y, result.x]).addTo(map).bindPopup("Start Location");
                } else if (markerType === "end") {
                    if (endMarker) endMarker.setLatLng([result.y, result.x]);
                    else endMarker = L.marker([result.y, result.x]).addTo(map).bindPopup("Destination");
                }
            });

            dropdown.appendChild(option);
        });
    }, 300));

    // Keyboard navigation
    input.addEventListener("keydown", function(e) {
        const items = dropdown.querySelectorAll(".suggestion-item");
        if (!items.length) return;

        if (e.key === "ArrowDown") {
            selectedIndex = (selectedIndex + 1) % items.length;
            updateActive(items, selectedIndex);
            e.preventDefault();
        } else if (e.key === "ArrowUp") {
            selectedIndex = (selectedIndex - 1 + items.length) % items.length;
            updateActive(items, selectedIndex);
            e.preventDefault();
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0) items[selectedIndex].click();
        }
    });

    function updateActive(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
    }
}

// Initialize autocomplete
setupAutocomplete("start", "start");
setupAutocomplete("end", "end");

// Show route
function showRoute() {
    if (!startMarker || !endMarker) {
        alert("Please select both start and destination locations.");
        return;
    }

    if (control) map.removeControl(control);

    control = L.Routing.control({
        waypoints: [
            startMarker.getLatLng(),
            endMarker.getLatLng()
        ],
        routeWhileDragging: true
    }).addTo(map);
}
