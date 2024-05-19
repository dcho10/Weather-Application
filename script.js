var searchButton = document.querySelector(".search");
var weatherData;
var currentTemperature = document.querySelector(".current-temperature");

currentTemperature.classList.remove("current-temperature");

function getApi () {
    var cityInput = document.getElementById("cityInput").value;
    if (!cityInput) {
        console.error("Enter a city");
        return;
    }
    
    // Makes the city input dynamic:
    var requestUrl = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityInput + "&appid=cf47c24adce42f69f08e497c8c6029c9";
    
    // Fetches data based on city input:
    fetch(requestUrl)
    .then (function (response) {
        return response.json();
    }) 
    .then(function (data) {
        console.log(data);

        if (data.length === 0) {
            console.error("Error fetching current weather data:", data.message);
            return;
        }   
            var city = data[0].name;
            // Immediately adds the searched item to the search history:
            saveSearchHistory(city);

            var lat = data[0].lat;
            console.log("Latitude:", lat);

            var lon = data[0].lon;
            console.log("Longitude:", lon);

            // Makes the forecast link dynamic:
            var forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=cf47c24adce42f69f08e497c8c6029c9&units=metric";
            
            fetch (forecastUrl)
                .then (function (forecastResponse) {
                    return forecastResponse.json();
            })
                .then(function (forecastData) {
                    console.log(forecastData);
                    weatherData = forecastData;
                    displayTemperature();
                    displayForecast();
            })
                .catch (function (error) {
                    console.error("Error fetching geo data:", error);
            });
        })
        .catch(function (error) {
            console.error("Error fetching current weather data:", error)
        })

        currentTemperature.classList.add("current-temperature");
    }

getApi();
searchButton.addEventListener("click", getApi);

// Displays the name, temperature, condition, humidity, wind speed and temperature icon for the searched city:
// Always want to target the list[0] because it has the information for the closest current time and temperature
// Weather[0] provides the naming conventions for that time and temperature 
function displayTemperature () {
    document.querySelector(".city").innerHTML = weatherData.city.name;
    document.querySelector(".temperature").innerHTML = "Temperature: " + Math.round(weatherData.list[0].main.temp) + " °C";

    var iconCode = weatherData.list[0].weather[0].icon;
    var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";
    var iconEl = document.querySelector(".icon");
    iconEl.src = iconUrl;
    iconEl.alt = "weather-icon";

    document.querySelector(".condition").innerHTML = weatherData.list[0].weather[0].main; 
    document.querySelector(".humidity").innerHTML = "Humidity: " + Math.round(weatherData.list[0].main.humidity) + " %";
    document.querySelector(".wind-speed").innerHTML = "Wind Speed: " + (weatherData.list[0].wind.speed) + " km/h";

    displayDate();
}

// Display today's date came from: https://www.freecodecamp.org/news/javascript-get-current-date-todays-date-in-js/

function displayDate() {
    var date = new Date();
    var day = date.getDate();

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var monthName = monthNames[date.getMonth()];
    var year = date.getFullYear();
    var currentDate = `${monthName} ${day}, ${year}`
    document.querySelector(".date").innerHTML = currentDate;
}

// Start on i = 7 because if each list item contains information for every 3rd hour, i = 7 would be 24 hours from i = 0
// Use i +=8 because will skip the arrays that are < 8 because you want 24 hours and it will log the 39th index which will give the 5th day
// List[i] will target index 7, 15, 23, 31, 39
function displayForecast() {
    var forecastContainer = document.querySelector(".forecast");
    forecastContainer.innerHTML = "";

    for (var i = 7; i <= weatherData.list.length; i += 8) {
        var date = new Date(weatherData.list[i].dt * 1000);
        var day = date.toLocaleDateString('en-US', { weekday: 'long' });        
        var temperature = Math.round(weatherData.list[i].main.temp) + " °C";
        var humidity = Math.round(weatherData.list[i].main.humidity) + " %";
        var wind = weatherData.list[i].wind.speed + " km/h";
        var condition = weatherData.list[i].weather[0].main; 

        var iconCode = weatherData.list[i].weather[0].icon;
        var iconUrl = "https://openweathermap.org/img/w/" + iconCode + ".png";

        var forecastItem = document.createElement("section");
        forecastItem.classList.add("dayForecast");
        forecastItem.innerHTML = `
        <h2>${day}</h2>
        <img class="forecastIcon" src="${iconUrl}" alt="weather-icon">
        <h2> Condition: ${condition}</h2>
        <h3> Temperature: ${temperature}</h3>
        <h4> Humidity: ${humidity}</h4>
        <h5> Wind Speed: ${wind}</h5>
    `;
    forecastContainer.appendChild(forecastItem);
    }
}

// Goes through the local storage to take any input from search history and returns as array
function getSearchHistory() {
    return JSON.parse(localStorage.getItem("searchHistory")) || [];
}

// Adds to search history using unshift, updates local storage with and displays the new item to search history
function saveSearchHistory(city) {
    var searchHistory = getSearchHistory();
    searchHistory.unshift(city);
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    displaySearchHistsory();
}

// For each item added to the search history, it creates and displays buttons for users to click on from their search history and retrieves the information for the user
function displaySearchHistsory() {
    var searchHistory = getSearchHistory();
    var searchHistoryContainer = document.getElementById("searchHistory");
    searchHistoryContainer.innerHTML = "";
    
    searchHistory.forEach(city => {
        var historyItem = document.createElement("li");
        var searchButton = document.createElement("button");

        searchButton.textContent = city;
        searchButton.classList.add("search");

        searchButton.addEventListener("click", () => {
            document.getElementById("cityInput").value = city;
            getApi();
        });

        historyItem.appendChild(searchButton);
        searchHistoryContainer.appendChild(historyItem);
    });
}

displaySearchHistsory();