
let allRecords = [];
let currentDataset = "playgrounds";

const API_ENDPOINTS = {
    playgrounds: "https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/aires-de-jeux-et-espaces-sportifs-geres-par-la-ville-de-bruxelles/records?limit=50",
    gemeentes: "https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/grands_quartiers_vbx/records?limit=50"
};

const datasetSelector = document.getElementById("dataset-selector");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

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
    voegFavorietenOptieToe(); // update de optie
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

function updateFilterOptions(records, datasetKey) {
    filterSelect.innerHTML = '<option value="all">Alle</option>';
    const opties = new Set();

    if (datasetKey === "playgrounds") {
        records.forEach(r => {
            if (r.horaire && r.horaire !== "?") opties.add(`horaire:${r.horaire}`);
            if (r.postalcode && r.postalcode !== "?") opties.add(`postcode:${r.postalcode}`);
        });
    } else if (datasetKey === "gemeentes") {
        records.forEach(r => {
            if (r.name_nl) opties.add(r.name_nl[0].toUpperCase());
        });
    }

    Array.from(opties).sort().forEach(optie => {
        const optionEl = document.createElement("option");
        optionEl.value = optie;
        optionEl.textContent = optie.replace("horaire:", "Openingsuren: ").replace("postcode:", "Postcode: ");
        filterSelect.appendChild(optionEl);
    });
}

function filterAndDisplay() {
    if (currentDataset === "favorieten") {
        displayFavorieten();
        return;
    }

    const search = searchInput.value.toLowerCase();
    const filter = filterSelect.value.toLowerCase();

    const filtered = allRecords.filter(record => {
        let matchSearch = true;
        let matchFilter = true;

        if (currentDataset === "playgrounds") {
            const type = (record.type || "").toLowerCase();
            const naam = (record.name || "").toLowerCase();
            const horaire = (record.horaire || "").toLowerCase();
            const postcode = (record.postalcode || "").toLowerCase();

            matchSearch = naam.includes(search) || type.includes(search);

            if (filter.startsWith("horaire:")) {
                const selectedHoraire = filter.replace("horaire:", "");
                matchFilter = horaire === selectedHoraire;
            } else if (filter.startsWith("postcode:")) {
                const selectedPostcode = filter.replace("postcode:", "");
                matchFilter = postcode === selectedPostcode;
            } else {
                matchFilter = filter === "all";
            }
        }

        if (currentDataset === "gemeentes") {
            const naam = (record.name_nl || "").toLowerCase();
            matchSearch = naam.includes(search);
            matchFilter = filter === "all" || naam.startsWith(filter);
        }

        return matchSearch && matchFilter;
    });

    displayData(filtered, currentDataset);
}

function displayFavorieten() {
    const favorieten = getFavorieten();
    const favRecords = allRecords.filter(record => favorieten.includes(record.elementid));
    displayData(favRecords, "playgrounds");
}

async function fetchData(datasetKey = "playgrounds") {
    try {
        const url = API_ENDPOINTS[datasetKey];
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP-fout! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data && Array.isArray(data.results)) {
            allRecords = data.results;
            updateFilterOptions(allRecords, datasetKey);
            filterAndDisplay();
        } else {
            throw new Error("Geen 'results' veld in de response");
        }

    } catch (error) {
        console.error("Fout bij het ophalen van de data:", error);
        document.getElementById("locations").innerText = `Fout bij laden van data: ${error.message}`;
    }
}

function displayData(records, datasetKey) {
    const container = document.getElementById("locations");
    container.innerHTML = "";

    if (!records || !Array.isArray(records) || records.length === 0) {
        container.innerText = "Geen data gevonden.";
        return;
    }

    const favorieten = getFavorieten();

    records.forEach(record => {
        const card = document.createElement("div");
        card.classList.add("location-card");

        if (datasetKey === "playgrounds" || datasetKey === "favorieten") {
            const id = record.elementid || "Onbekend";
            const isFavoriet = favorieten.includes(id);
            const naam = record.name || `Speelplein #${id}`;
            const type = record.type || "Onbekend";
            const adres = record.address || "Adres onbekend";
            const openingUren = record.horaire || "Uur onbekend";

            card.innerHTML = `
                <h2>${naam}</h2>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Adres:</strong> ${adres}</p>
                <p><strong>Openingsuren:</strong> ${openingUren}</p>
                <button class="fav-btn" data-id="${id}">
                    ${isFavoriet ? "❌ Verwijder uit favorieten" : "❤️ Voeg toe aan favorieten"}
                </button>
            `;
        } else if (datasetKey === "gemeentes") {
            const naam = record.name_nl || "Geen naam";
            const label = record.name_fr || "Geen beschrijving";

            card.innerHTML = `
                <h2>${naam}</h2>
                <p><strong>Label (FR):</strong> ${label}</p>
            `;
        }

        container.appendChild(card);
    });

    container.querySelectorAll(".fav-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            toggleFavoriet(id);
            filterAndDisplay();
        });
    });
}

voegFavorietenOptieToe(); // bij laden, check of optie nodig is
fetchData();
