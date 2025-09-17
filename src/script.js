//Rewriting the whole weather app by myself using module pattern and SOLID principles instead of a single monolithic class - Weather App

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
			unit : document.getElementById('unit'),
			toggleBtn : document.getElementById('toggleUnit'),
			weatherIcon : document.getElementById('current-weather-icon'),
			weatherDesc : document.getElementById('weather-desc'),
			humidity : document.getElementById('humidity'),
			windSpeed : document.getElementById('wind-speed'),
			dailyForecast : document.getElementById('daily-forecast'),
			loading : document.querySelector('.loading'),
			errorMessage : document.querySelector('.error'),
			errorText : document.querySelector('.error p'),
			retryBtn : document.getElementById('retry-btn'),
			closeError : document.getElementById('close-error'),
		};
	}
	
	bindEventListeners(){
		this.elements.searchBtn.addEventListener('click', () => {
			this.handleSearch();
		}); 
		
		this.elements.locationInput.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') this.handleSearch();
		});
		
		this.elements.toggleBtn.addEventListener('click', () => {
			this.toggleUnit();
		});
		
		this.elements.closeError.addEventListener('click', () => {
			this.hideError();
			this.elements.locationInput.focus();
		});

		this.elements.retryBtn.addEventListener('click', () => {
			this.hideError();
			this.handleSearch();
		});

	}
}

const handleSearch = async function() {
	const location = this.elements.locationInput.value.trim() || this.locationKey;
	if(!location){
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
	}
};


const makeFetchRequest = async function(url) {
  this.showLoading();	
  try {
    const res = await fetch(url);
    const text = await res.text();                 // read raw body

    if (!res.ok) {
		throw new Error(`API ${res.status}: ${text}`);
	}
    const json = JSON.parse(text);
	
    this.updateWeatherDisplay(json);
  } catch (e) {
	  this.showError(e.message);
  }
  finally {
	  this.hideLoading();
  }
};

const updateWeatherDisplay = function(data) {
	console.log(data);
	const location = data.resolvedAddress || data.address;
	const locationName = this.formatLocation(location);
	console.log(locationName);
	this.elements.currentLocation.innerText = locationName;
	this.elements.currentTemperature.innerText = data.currentConditions.temp;
	this.elements.humidity.innerText = data.currentConditions.humidity;
	this.elements.windSpeed.innerText = data.currentConditions.windspeed;
	this.updateWeatherIcon(data.currentConditions.icon);
	this.weatherForecast(data.days.slice(1, 4));
	this.elements.weatherDesc.innerText = data.currentConditions.conditions
}


const updateWeatherIcon = function(icon) {
	this.elements.weatherIcon.innerHTML = '';
	const iconMap = {
		"clear-day": '<i class="fas fa-sun"></i>',
		"clear-night": '<i class="fas fa-moon"></i>',
		"partly-cloudy-day": '<i class="fas fa-cloud-sun"></i>',
		"partly-cloudy-night": '<i class="fas fa-cloud-moon"></i>',
		"cloudy": '<i class="fas fa-cloud"></i>',
		"rain": '<i class="fas fa-cloud-showers-heavy"></i>',
		"snow": '<i class="fas fa-snowflake"></i>',
		"thunder": '<i class="fas fa-bolt"></i>',
		"wind": '<i class="fas fa-wind"></i>',
		"fog": '<i class="fas fa-smog"></i>'
	};
	
	this.elements.weatherIcon.innerHTML = iconMap[icon] || '<i class="fas fa-cloud-sun"></i>';
}


const weatherForecast = function(days) {
	this.elements.dailyForecast.innerHTML = '';
	console.log(days);
	const dayMap = [
		"Sunday",
		"Monday",
		"Tueday",
		"Wedday",
		"Thurday",
		"Friday",
		"Saturday"
	];
	
	const iconMap = {
		"clear-day": '<i class="fas fa-sun"></i>',
		"clear-night": '<i class="fas fa-moon"></i>',
		"partly-cloudy-day": '<i class="fas fa-cloud-sun"></i>',
		"partly-cloudy-night": '<i class="fas fa-cloud-moon"></i>',
		"cloudy": '<i class="fas fa-cloud"></i>',
		"rain": '<i class="fas fa-cloud-showers-heavy"></i>',
		"snow": '<i class="fas fa-snowflake"></i>',
		"thunder": '<i class="fas fa-bolt"></i>',
		"wind": '<i class="fas fa-wind"></i>',
		"fog": '<i class="fas fa-smog"></i>'
	};
	
	
	days.forEach((day) => {
		console.log(day);
		const dayElement = document.createElement('div');
		dayElement.classList.add('daily-item');
		const date = new Date(day.datetime);
		
		const dayName = dayMap[date.getDay()];
		console.log(date.getDay());
		console.log(dayName);
		const iconClass = iconMap[day.icon] || '<i class="fas fa-cloud-sun"></i>';
		console.log(iconClass);
		dayElement.innerHTML = `
                <div class="daily-day">${dayName}</div>
                <div class="daily-weather">
                    ${iconClass}
                    <span class="daily-desc">${day.conditions}</span>
                </div>
                <div class="daily-temps">
                    <span class="daily-high">${Math.round(day.tempmax)}°</span>
                    <span class="daily-low">${Math.round(day.tempmin)}°</span>
                </div>
            `;
		this.elements.dailyForecast.appendChild(dayElement);
	} )

	
}


const toggleUnit = function() {
	this.currentUnit = this.currentUnit === 'metric' ? 'imperial' : 'metric';
	this.elements.unit.innerText = this.currentUnit === 'metric' ? '°C' : '°F';
	if(this.locationKey){
		this.fetchWeatherData(this.locationKey);
	}
}

const formatLocation = function(location) {
	const unformattedLocation = location.split(',');
	console.log(unformattedLocation);
	const upperCaseLocation = unformattedLocation.map((name) =>  {
		return name.trim().charAt(0).toUpperCase() + name.trim().slice(1)
	});
	const fomattedLocation = upperCaseLocation.join(', ');
	console.log(upperCaseLocation);
	return fomattedLocation;
	
}

const showLoading = function() {
	this.elements.loading.classList.add('show');
}
const hideLoading = function(){
	this.elements.loading.classList.remove('show');
}
const showError = function(error) {
	this.elements.errorMessage.classList.add('show');
	this.elements.errorText.innerText = error;
}
const hideError = function() {
	this.elements.errorMessage.classList.remove('show');
}



Object.assign(WeatherApp.prototype, {
	handleSearch,
	fetchWeatherData,
	makeFetchRequest,
	updateWeatherDisplay,
	updateWeatherIcon,
	weatherForecast,
	formatLocation,
	toggleUnit,
	showLoading,
	hideLoading,
	showError,
	hideError,
});

document.addEventListener('DOMContentLoaded', ()=> {
	const newWeatherApp = new WeatherApp();
	
	// Keyboard navigation
	document.addEventListener('keydown', (e) => {
		if( e.ctrlKey && e.key === '/' ) {
			e.preventDefault();
			document.getElementById('location-input').focus();
		}	
	});
});
