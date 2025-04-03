let allRecords = [];
let currentDataset = "playgrounds";
let map;
let markers = [];
 
const API_ENDPOINTS = {
    playgrounds: "https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/aires-de-jeux-et-espaces-sportifs-geres-par-la-ville-de-bruxelles/records?limit=50"
};
 
const datasetSelector = document.getElementById("dataset-selector");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
 
// Donker thema toggle
const themeSwitch = document.getElementById("theme-switch");
themeSwitch.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode");
});
 
// Favorieten in localStorage
function getFavorieten() {
    return JSON.parse(localStorage.getItem("favorieten")) || [];
}
 
function toggleFavoriet(id) {
    let favorieten = getFavorieten();
    if (favorieten.includes(id)) {
        favorieten = favorieten.filter(fav => fav !== id);
    } else {
        favorieten.push(id);
    }
    localStorage.setItem("favorieten", JSON.stringify(favorieten));
    voegFavorietenOptieToe();
}
 
function voegFavorietenOptieToe() {
    const favorieten = getFavorieten();
    const selector = document.getElementById("dataset-selector");
    const bestaatAl = selector.querySelector('option[value="favorieten"]');
    if (!bestaatAl && favorieten.length > 0) {
        const optie = document.createElement("option");
        optie.value = "favorieten";
        optie.textContent = "⭐ Favorieten";
        selector.appendChild(optie);
    }
}
 
// Dataset veranderen
datasetSelector.addEventListener("change", (e) => {
    currentDataset = e.target.value;
    if (currentDataset === "favorieten") {
        displayFavorieten();
    } else {
        fetchData(currentDataset);
    }
});
 
searchInput.addEventListener("input", filterAndDisplay);
filterSelect.addEventListener("change", filterAndDisplay);
 
function updateFilterOptions(records) {
    filterSelect.innerHTML = '<option value="all">Alle</option>';
    const opties = new Set();
    records.forEach(r => {
        if (r.horaire && r.horaire !== "?") opties.add(`horaire:${r.horaire}`);
        if (r.postalcode && r.postalcode !== "?") opties.add(`postcode:${r.postalcode}`);
    });
    Array.from(opties).sort().forEach(optie => {
        const el = document.createElement("option");
        el.value = optie;
        el.textContent = optie.replace("horaire:", "Openingsuren: ").replace("postcode:", "Postcode: ");
        filterSelect.appendChild(el);
    });
}
 
function filterAndDisplay() {
    if (currentDataset === "favorieten") {
        displayFavorieten();
        return;
    }
    const search = searchInput.value.toLowerCase();
    const filter = filterSelect.value.toLowerCase();
    const filtered = allRecords.filter(r => {
        const naam = (r.name || "").toLowerCase();
        const type = (r.type || "").toLowerCase();
        const horaire = (r.horaire || "").toLowerCase();
        const postcode = (r.postalcode || "").toLowerCase();
 
        const matchSearch = naam.includes(search) || type.includes(search);
        let matchFilter = true;
 
        if (filter.startsWith("horaire:")) {
            matchFilter = horaire === filter.replace("horaire:", "");
        } else if (filter.startsWith("postcode:")) {
            matchFilter = postcode === filter.replace("postcode:", "");
        } else {
            matchFilter = filter === "all";
        }
 
        return matchSearch && matchFilter;
    });
 
    displayData(filtered);
}
 
function displayFavorieten() {
    const favs = getFavorieten();
    const favRecords = allRecords.filter(r => favs.includes(r.elementid));
    displayData(favRecords);
}
 
function clearMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = [];
}
 
function displayData(records) {
    const container = document.getElementById("locations");
    container.innerHTML = "";
    clearMarkers();
 
    const favs = getFavorieten();
 
    records.forEach(record => {
        const id = record.elementid || "?";
        const naam = record.name || `Speelplein #${id}`;
        const type = record.type || "Onbekend";
        const adres = record.address || "Adres onbekend";
        const uren = record.horaire || "Uur onbekend";
        const isFav = favs.includes(id);
 
        const card = document.createElement("div");
        card.classList.add("location-card");
        card.innerHTML = `
            <h2>${naam}</h2>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Adres:</strong> ${adres}</p>
            <p><strong>Openingsuren:</strong> ${uren}</p>
            <button class="fav-btn" data-id="${id}">
                ${isFav ? "❌ Verwijder uit favorieten" : "❤️ Voeg toe aan favorieten"}
            </button>
        `;
        container.appendChild(card);
 
        const btn = card.querySelector(".fav-btn");
        btn.addEventListener("click", () => {
            toggleFavoriet(id);
            filterAndDisplay();
        });
 
        const coords = record.geo_point_2d;
        if (coords && coords.lat && coords.lon) {
            const marker = L.marker([coords.lat, coords.lon]).addTo(map);
            marker.bindPopup(`<strong>${naam}</strong><br>${adres}`);
            markers.push(marker);
        }
    });
}
 
async function fetchData() {
    try {
        const url = API_ENDPOINTS[currentDataset];
        const res = await fetch(url);
        if (!res.ok) throw new Error("Fout bij API");
        const data = await res.json();
        allRecords = data.results;
        updateFilterOptions(allRecords);
        filterAndDisplay();
    } catch (err) {
        console.error(err);
        document.getElementById("locations").innerText = "Fout bij laden van data";
    }
}
 
function initMap() {
    map = L.map("map").setView([50.85, 4.35], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
    }).addTo(map);
}
 
voegFavorietenOptieToe();
initMap();
fetchData();