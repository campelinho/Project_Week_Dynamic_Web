async function fetchData() {
    try {
        const response = await fetch("https://opendata.brussels.be/api/explore/v2.1/catalog/datasets/aires-de-jeux-et-espaces-sportifs-geres-par-la-ville-de-bruxelles/records?limit=20");

        if (!response.ok) {
            throw new Error(`HTTP-fout! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📦 Gehele API-response:", data);

        // Controleer of er een 'results' array is
        if (data && Array.isArray(data.results)) {
            displayData(data.results);  // ✅ Juiste aanroep
        } else {
            throw new Error("Geen 'results' veld in de response");
        }

    } catch (error) {
        console.error("Fout bij het ophalen van de data:", error);
        document.getElementById("locations").innerText = `Fout bij laden van data: ${error.message}`;
    }
}

function displayData(records) {
    const container = document.getElementById("locations");
    container.innerHTML = "";

    if (!records || !Array.isArray(records)) {
        container.innerText = "Geen data gevonden.";
        return;
    }

    records.forEach(record => {
        const id = record.elementid || "Geen ID";
        const type = record.type || "Onbekend";
        const status = record.statut || "Niet gespecificeerd";

        const card = document.createElement("div");
        card.classList.add("location-card");
        card.innerHTML = `
            <h2>Speelplein #${id}</h2>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Type:</strong> ${type}</p>
        `;
        container.appendChild(card);
    });
}

fetchData();
