//Reweriting the whole weather app by myself using module pattern and SOLID principles instead of a single monolithic class - Weather App

class WeatherApp {
	constructor() {
		this.locationKey = 'London';
		this.apiKey = '3766ZQMN2HU488LF4VYTMS7DC';
		this.currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit

		this.initializeApp();
		this.bindEventListeners();
		
	}

	initializeApp() {
		this.elements = {
			locationInput: document.getElementById('location-input'),
			searchBtn : document.getElementById('search-btn'),
			currentLocation: document.getElementById('current-location'),
			currentTemperature : document.getElementById('current-temp'),
			unit : document.getElementsByClassName('unit'),
			toggleBtn : document.getElementById('toggleUnit'),
			weatherIcon : document.getElementById('current-weather-icon'),
			humidity : document.getElementById('humidity'),
			windSpeed : document.getElementById('wind-speed'),
			dailyForecast : document.getElementById('daily-forecast'),
			loading : document.querySelector('.loading'),
			errorMessage : document.querySelector('.error'),
			errorText : document.querySelector('.error p'),
			retryBtn : document.getElementById('retry-btn'),
		};
	}
	
	bindEventListeners(){
		this.elements.searchBtn.addEventListener('click', () => {
			this.handleSearch();
		}); 
		
		this.elements.locationInput.addEventListener('keyDown', (e) => {
			if (e.key === 'Enter') this.handleSearch();
		});
		
		this.elements.toggleBtn.addEventListener('click', () => {
			this.toggleUnit();
		});
	}
	
	updateWeatherDisplay(data) {
		console.log(data);
		this.elements.currentLocation.innerText = data.resolved
	}
}

const handleSearch = async function() {
	const location = this.elements.locationInput.value.trim() || this.locationKey;
	if(!location){
		console.log('No input location');
		return;
	}
	this.locationKey = this.formatLocation(location);
	await this.fetchWeatherData(location);
	this.elements.locationInput.value = '';
}


const fetchWeatherData = async function (location) {
	try {
		const unitGroup = this.currentUnit === 'metric' ? 'metric' : 'us';
		const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=${this.apiKey}`;
		await this.makeFetchRequest(url);
	} catch (e) {
		console.log('Fetching Error:' + e.message);
	}
};

// replace your makeFetchRequest with this for better diagnostics
const makeFetchRequest = async function(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();                 // read raw body
    console.log('HTTP', res.status, res.statusText);
    console.log('Response body:', text);

    if (!res.ok) throw new Error(`API ${res.status}: ${text}`);

    const json = JSON.parse(text);
	console.log(json);
    this.updateWeatherDisplay(json);
  } catch (e) {
    console.error('Request Error:', e);
    // show friendly UI error
    this.elements.errorText.textContent = e.message;
    this.elements.errorMessage.classList.add('visible');
  }
};


const toggleUnit =  function() {
	this.currentUnit = this.currentUnit === 'metric' ? 'imperial' : 'metric';
	console.log(this.currentUnit);
	if(this.locationKey){
		this.fetchWeatherData(this.locationKey);
	}
	
}

const formatLocation = function(location) {
	console.log(location);
}


Object.assign(WeatherApp.prototype, {
	handleSearch,
	fetchWeatherData,
	makeFetchRequest,
	toggleUnit,
	formatLocation,
});


document.addEventListener('DOMContentLoaded', ()=> {
	const newWeatherApp = new WeatherApp();
})
