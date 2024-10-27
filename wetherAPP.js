const apiKey = '3cfc66aa72ca3994c48e7a04f8b2cb83';
let allCountries = []; 

document.addEventListener('DOMContentLoaded', () => {
    loadCountries();
    getCurrentWeather();
});

document.getElementById('search-button').addEventListener('click', searchCityWeather);
document.getElementById('country-input').addEventListener('input', filterCountries); // Filter countries as user types

async function loadCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) throw new Error("Failed to load country list.");
        allCountries = await response.json();
        populateCountryList(allCountries);
    } catch (error) {
        console.error("Error loading countries:", error);
        alert("Failed to load country list. Please try again.");
    }
}

// Populate datalist with country options
function populateCountryList(countries) {
    const countryList = document.getElementById('countries');
    countryList.innerHTML = '';
    countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name.common;
        countryList.appendChild(option);
    });
}

// Filter countries based on search input and sort alphabetically
function filterCountries() {
    const searchTerm = document.getElementById('country-input').value.toLowerCase();
    const filteredCountries = allCountries
        .filter(country => country.name.common.toLowerCase().includes(searchTerm))
        .sort((a, b) => a.name.common.localeCompare(b.name.common)); // Sort alphabetically

    populateCountryList(filteredCountries); // Repopulate datalist with filtered and sorted results
}

// Function to get current location weather
function getCurrentWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherData(`lat=${latitude}&lon=${longitude}`, 'search-results');
        });
    } else {
        document.getElementById('search-results').innerText = "Geolocation is not supported by this browser.";
    }
}

// Function to search weather by city and country
function searchCityWeather() {
    const country = document.getElementById('country-input').value.trim();
    const city = document.getElementById('city-input')?.value.trim(); // Check if city input is defined

    if (!country) return alert("Please enter a country name.");
    
    // Fetch weather by country (and optional city if input exists)
    const query = city ? `q=${city},${country}` : `q=${country}`;
    fetchWeatherData(query, 'search-results');
}

// Function to fetch weather data and display
function fetchWeatherData(query, elementId) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}&units=metric`)
        .then(response => response.ok ? response.json() : Promise.reject("Location not found"))
        .then(data => {
            displayWeather(data, elementId);
            setWeatherBackground(data.weather[0].main.toLowerCase());
        })
        .catch(error => {
            document.getElementById(elementId).innerText = error;
        });
}


function displayWeather(data, elementId) {
    const { name, sys, main, weather } = data;

   
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);

    const weatherInfo = `
        <h2>${name}, ${sys.country}</h2>
        <p>${formattedDate}</p> <!-- Display formatted date -->
        <p>Temperature: ${main.temp}°C</p>
        <p>Humidity: ${main.humidity}%</p>
        <p>Condition: ${weather[0].description}</p>
    `;
    document.getElementById(elementId).innerHTML = weatherInfo;
}


// Function to set background based on weather condition
function setWeatherBackground(condition) {
    document.body.className = 'default';
    if (condition.includes('sun')) {
        document.body.classList.add('sunny');
    } else if (condition.includes('cloud')) {
        document.body.classList.add('cloudy');
    } else if (condition.includes('rain')) {
        document.body.classList.add('rainy');
    }
}
