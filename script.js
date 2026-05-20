const API_KEY = "QLAQm2zFKYhu3nedvh9oGA1JiSYyvJ6VLgT4egxF";
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


const message = document.getElementById("message");
const apodContainer = document.getElementById("apod-container");

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");

const marsButton = document.getElementById("mars-btn");
const marsResults = document.getElementById("mars-results");

const asteroidButton = document.getElementById("asteroid-btn");
const asteroidResults = document.getElementById("asteroid-results");

const favoritesContainer = document.getElementById("favorites-container");
const themeToggle = document.getElementById("theme-toggle");


async function loadAPOD() 
{
    try {
        message.textContent = "🌠 Loading Astronomy Picture of the Day...";
        await delay(100);

        const response = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
        );

        const data = await response.json();

        let mediaContent = "";

        if (data.media_type === "image") {
            mediaContent = `<img src="${data.url}" alt="${data.title}">`;
        } else if (data.media_type === "video") {
            mediaContent = `
                <iframe
                    src="${data.url}"
                    width="100%"
                    height="400"
                    frameborder="0"
                    allowfullscreen>
                </iframe>
            `;
        }

        apodContainer.innerHTML = `
            <div class="space-card">
                ${mediaContent}
                <h2>${data.title}</h2>
                <p><strong>Date:</strong> ${data.date}</p>
                <p>${data.explanation}</p>
                <button class="action-btn"
                        onclick="saveFavorite('${data.title}', '${data.url}')">
                    ❤️ Save to Favorites
                </button>
            </div>
        `;

        message.textContent = "";
    } catch (error) {
        console.error(error);
        message.textContent = "❌ Failed to load Astronomy Picture.";
    }
}


searchButton.addEventListener("click", searchImages);

async function searchImages() 
{
    const query = searchInput.value.trim();

    if (query === "") {
        message.textContent = "Please enter a search term.";
        return;
    }

    try {
        message.textContent = "🔍 Searching NASA images...";
        searchResults.innerHTML = "";
        await delay(100);

        const response = await fetch(
            `https://images-api.nasa.gov/search?q=${query}&media_type=image`
        );

        const data = await response.json();
        const items = data.collection.items.slice(0, 8);

        if (items.length === 0) {
            message.textContent = "No images found.";
            return;
        }

        items.forEach(item => {
            const title = item.data[0].title;
            const image = item.links[0].href;

            searchResults.innerHTML += `
                <div class="space-card">
                    <img src="${image}" alt="${title}">
                    <h3>${title}</h3>
                    <button class="action-btn"
                            onclick="saveFavorite('${title}', '${image}')">
                        ❤️ Save
                    </button>
                </div>
            `;
        });

        message.textContent = "";
    } catch (error) {
        message.textContent = "❌ Error searching images.";
    }
}


marsButton.addEventListener("click", loadMarsPhotos);

async function loadMarsPhotos() 
{
    try {
        message.textContent = "🌌 Loading featured space images...";
        marsResults.innerHTML = "";
        await delay(100);

        await new Promise(resolve => setTimeout(resolve, 100));

        const featuredTopics = [
            "earth from space",
            "mars",
            "jupiter",
            "saturn",
            "nebula",
            "galaxy"
        ];

        for (const topic of featuredTopics) {
            const response = await fetch(
                `https://images-api.nasa.gov/search?q=${encodeURIComponent(topic)}&media_type=image`
            );

            const data = await response.json();
            const items = data.collection.items;

            // Find the first item that actually contains image links
            const validItem = items.find(
                item => item.links && item.links.length > 0
            );

            if (validItem) {
                const title = validItem.data[0].title;
                const image = validItem.links[0].href;

                marsResults.innerHTML += `
                    <div class="space-card">
                        <img src="${image}" alt="${title}">
                        <h3>${title}</h3>
                        <p><strong>Category:</strong> ${topic.toUpperCase()}</p>
                        <button class="action-btn"
                                onclick="saveFavorite('${title}', '${image}')">
                            ❤️ Save
                        </button>
                    </div>
                `;
            }
        }

        message.textContent = "";
    } catch (error) {
        console.error(error);
        message.textContent = "❌ Failed to load featured space images.";
    }
}

asteroidButton.addEventListener("click", loadAsteroids);

async function loadAsteroids() 
{
    try {
        message.textContent = "☄ Loading asteroid data...";
        asteroidResults.innerHTML = "";
        await delay(100);

        const response = await fetch(
            `https://api.nasa.gov/neo/rest/v1/feed?api_key=${API_KEY}`
        );

        const data = await response.json();
        const today = Object.keys(data.near_earth_objects)[0];
        const asteroids = data.near_earth_objects[today].slice(0, 8);

        asteroids.forEach(asteroid => {
            asteroidResults.innerHTML += `
                <div class="space-card">
                    <h3>${asteroid.name}</h3>
                    <p>
                        <strong>Diameter:</strong>
                        ${Math.round(
                            asteroid.estimated_diameter.meters
                                .estimated_diameter_max
                        )} meters
                    </p>
                    <p>
                        <strong>Hazardous:</strong>
                        ${asteroid.is_potentially_hazardous_asteroid ? "Yes ⚠️" : "No ✅"}
                    </p>
                </div>
            `;
        });

        message.textContent = "";
    } catch (error) {
        message.textContent = "❌ Failed to load asteroid data.";
    }
}


function saveFavorite(title, image) 
{
    const favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favorites.push({ title, image });

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();
}

function loadFavorites() 
{
    const favorites =
        JSON.parse(localStorage.getItem("favorites")) || [];

    favoritesContainer.innerHTML = "";

    favorites.forEach(item => {
        favoritesContainer.innerHTML += `
            <div class="space-card">
                <img src="${item.image}" alt="${item.title}">
                <h3>${item.title}</h3>
            </div>
        `;
    });
}

themeToggle.addEventListener("click", () => 
    {
    document.body.classList.toggle("light-mode");
});


loadAPOD();
loadFavorites();