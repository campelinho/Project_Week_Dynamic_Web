Deze webapplicatie toont speelpleinen en sportlocaties in Brussel met behulp van open data. De applicatie maakt gebruik van JavaScript, Fetch API en Leaflet.js om gegevens te laden en een interactieve kaart te tonen.


Functionaliteiten:

Lijstweergave van speelpleinen en sportlocaties.
Zoekfunctie en filters op postcode en openingsuren.
Favorieten systeem: locaties opslaan in LocalStorage.
Interactieve Leaflet-kaart met markers.
Thema-switcher: Donker/licht modus.

Gebruikte API's:
Speelpleinen & Sportlocaties API

Structuur:
Projectmap
├── index.html       # HTML-bestand
├── styles.css       # CSS-bestand voor styling
├── script.js        # Hoofdscript met logica
└── README.md        # Documentatie


Installatiehandleiding
Clone de repository:

git clone https://github.com/jouwgebruikersnaam/jouwrepository.git

Open index.html in een browser.

Geniet van de interactieve webapp!

------------------------------------------------------------------------------------------------------------------------------------------------------------------

Belangrijke Code Uitleg

Data ophalen (API Call):

Bestand: script.js, Lijn: 24-40

async function fetchData(datasetKey = "playgrounds") {
    try {
        const url = API_ENDPOINTS[datasetKey];
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP-fout! Status: ${response.status}`);
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
    }
}

------------------------------------------------------------------------------------------------------------------------------------------------------------------
Interactie met kaart (Leaflet.js)

Bestand: script.js, Lijn: 50-60

let map = L.map('map').setView([50.85, 4.35], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
let markerLayer = L.layerGroup().addTo(map);

function clearMap() {
    markerLayer.clearLayers();
}

Favorieten beheren (LocalStorage)

Bestand: script.js, Lijn: 100-120

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
}

------------------------------------------------------------------------------------------------------------------------------------------------------------------

Screenshots

Gebruikte bronnen:

Open Data Brussel API
Leaflet.js Documentatie
Stack Overflow & MDN Web Docs


Team & Taakverdeling:

 Naam             Taak
 Gabriel          API-koppeling & Data ophalen
 Gabriel          UI Design & CSS Styling
 Souhail          Leaflet Kaart integratie
 Souhail          Documentatie & ReadMe
