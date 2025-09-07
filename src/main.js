// Weather App JavaScript
class WeatherApp {
	constructor() {
		this.apiKey = '3766ZQMN2HU488LF4VYTMS7DC';
		this.currentUnit = 'metric'; // 'metric' for Celsius, 'imperial' for Fahrenheit
		this.currentLocation = null;

		this.initializeApp();
		this.bindEvents();
		this.loadDefaultLocation();
	}

	initializeApp() {
		this.elements = {
			locationInput: document.getElementById('location-input'),
			searchBtn: document.getElementById('search-btn'),
			currentLocation: document.querySelector('.location h2'),
			currentTemp: document.getElementById('current-temp'),
			weatherDesc: document.getElementById('weather-desc'),
			feelsLike: document.querySelector('.feels-like'),
			currentWeatherIcon: document.querySelector('.weather-icon'),
			humidity: document.getElementById('humidity'),
			windSpeed: document.getElementById('wind-speed'),
			dailyForecast: document.getElementById('daily-forecast'),
			loadingSpinner: document.querySelector('.loading'),
			errorMessage: document.querySelector('.error'),
			errorText: document.querySelector('.error p'),
			retryBtn: document.getElementById('retry-btn'),
		};
	}

	bindEvents() {
		// Search functionality
		this.elements.searchBtn.addEventListener('click', () =>
			this.handleSearch()
		);
		this.elements.locationInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') this.handleSearch();
		});

		// Retry button
		if (this.elements.retryBtn) {
			this.elements.retryBtn.addEventListener('click', () =>
				this.hideError()
			);
		}

		// Unit toggle (click on temperature)
		this.elements.currentTemp.addEventListener('click', () =>
			this.toggleUnit()
		);
	}

	async handleSearch() {
		const location = this.elements.locationInput.value.trim();
		if (!location) return;

		await this.fetchWeatherData(location);
		this.elements.locationInput.value = '';
	}

	async loadDefaultLocation() {
		// Try to get user's location first, fallback to London
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					this.fetchWeatherByCoords(
						position.coords.latitude,
						position.coords.longitude
					);
				},
				() => {
					this.fetchWeatherData('London');
				}
			);
		} else {
			this.fetchWeatherData('London');
		}
	}

	async fetchWeatherByCoords(lat, lon) {
		// For Visual Crossing, we'll use reverse geocoding to get location name first
		// But for simplicity, we'll use a default location
		await this.fetchWeatherData('London');
	}

	async fetchWeatherData(location) {
		this.showLoading();
		const unitGroup = this.currentUnit === 'metric' ? 'metric' : 'us';
		const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
			location
		)}?unitGroup=${unitGroup}&key=${this.apiKey}&contentType=json`;
		await this.makeWeatherRequest(url);
	}

	async makeWeatherRequest(url) {
		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`Weather data not found`);
			}

			const data = await response.json();
			this.currentLocation = data.resolvedAddress || data.address;
			await this.updateWeatherDisplayVC(data);
		} catch (error) {
			this.showError('Unable to fetch weather data. Please try again.');
		} finally {
			this.hideLoading();
		}
	}

	// Visual Crossing includes forecast data in the main request, so we don't need a separate method

	// Create new method for Visual Crossing data format
	async updateWeatherDisplayVC(data) {
		const currentConditions = data.currentConditions;
		const today = data.days[0];

		// Update location and basic info
		this.elements.currentLocation.textContent =
			data.resolvedAddress || data.address;
		this.elements.currentTemp.textContent = Math.round(
			currentConditions.temp
		);
		this.elements.weatherDesc.textContent = currentConditions.conditions;
		this.elements.feelsLike.textContent = `${Math.round(
			currentConditions.feelslike
		)}°${this.currentUnit === 'metric' ? 'C' : 'F'}`;

		// Update weather icon
		this.updateWeatherIconVC(currentConditions.icon);

		// Update weather details
		this.elements.humidity.textContent = `${Math.round(
			currentConditions.humidity
		)}%`;
		this.elements.windSpeed.textContent = `${Math.round(
			currentConditions.windspeed
		)} ${this.currentUnit === 'metric' ? 'km/h' : 'mph'}`;

		// Update forecast (3-day only)
		this.updateDailyForecastVC(data.days.slice(1, 4));
	}

	updateWeatherIconVC(iconCode) {
		const iconMap = {
			'clear-day': 'fas fa-sun',
			'clear-night': 'fas fa-moon',
			'partly-cloudy-day': 'fas fa-cloud-sun',
			'partly-cloudy-night': 'fas fa-cloud-moon',
			cloudy: 'fas fa-cloud',
			rain: 'fas fa-cloud-rain',
			snow: 'fas fa-snowflake',
			sleet: 'fas fa-cloud-rain',
			wind: 'fas fa-wind',
			fog: 'fas fa-smog',
			thunderstorm: 'fas fa-bolt',
		};

		const iconClass = iconMap[iconCode] || 'fas fa-cloud-sun';
		this.elements.currentWeatherIcon.innerHTML = `<i class="${iconClass}"></i>`;
	}

	updateDailyForecastVC(dailyData) {
		this.elements.dailyForecast.innerHTML = '';
		const days = [
			'Sunday',
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday',
		];

		dailyData.forEach((day) => {
			const dayElement = document.createElement('div');
			dayElement.className = 'daily-item';

			const date = new Date(day.datetime);
			const dayName = days[date.getDay()];

			const iconMap = {
				'clear-day': 'fas fa-sun',
				'clear-night': 'fas fa-moon',
				'partly-cloudy-day': 'fas fa-cloud-sun',
				'partly-cloudy-night': 'fas fa-cloud-moon',
				cloudy: 'fas fa-cloud',
				rain: 'fas fa-cloud-rain',
				snow: 'fas fa-snowflake',
				sleet: 'fas fa-cloud-rain',
				wind: 'fas fa-wind',
				fog: 'fas fa-smog',
				thunderstorm: 'fas fa-bolt',
			};

			const iconClass = iconMap[day.icon] || 'fas fa-cloud-sun';

			dayElement.innerHTML = `
                <div class="daily-day">${dayName}</div>
                <div class="daily-weather">
                    <i class="daily-icon ${iconClass}"></i>
                    <span class="daily-desc">${day.conditions}</span>
                </div>
                <div class="daily-temps">
                    <span class="daily-high">${Math.round(day.tempmax)}°</span>
                    <span class="daily-low">${Math.round(day.tempmin)}°</span>
                </div>
            `;

			this.elements.dailyForecast.appendChild(dayElement);
		});
	}

	toggleUnit() {
		this.currentUnit =
			this.currentUnit === 'metric' ? 'imperial' : 'metric';
		if (this.currentLocation) {
			this.fetchWeatherData(this.currentLocation);
		}
	}

	showLoading() {
		this.elements.loadingSpinner.classList.add('show');
	}

	hideLoading() {
		this.elements.loadingSpinner.classList.remove('show');
	}

	showError(message) {
		this.elements.errorText.textContent = message;
		this.elements.errorMessage.classList.add('show');
	}

	hideError() {
		this.elements.errorMessage.classList.remove('show');
		if (this.currentLocation) {
			this.fetchWeatherData(this.currentLocation);
		} else {
			this.loadDefaultLocation();
		}
	}
}

// Animation utilities
class AnimationUtils {
	static fadeIn(element, duration = 300) {
		element.style.opacity = '0';
		element.style.display = 'block';

		let start = null;
		function animate(timestamp) {
			if (!start) start = timestamp;
			const progress = timestamp - start;

			element.style.opacity = Math.min(progress / duration, 1);

			if (progress < duration) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);
	}

	static slideIn(element, direction = 'up', duration = 300) {
		const transforms = {
			up: 'translateY(20px)',
			down: 'translateY(-20px)',
			left: 'translateX(20px)',
			right: 'translateX(-20px)',
		};

		element.style.transform = transforms[direction];
		element.style.opacity = '0';
		element.style.transition = `all ${duration}ms ease`;

		requestAnimationFrame(() => {
			element.style.transform = 'translate(0)';
			element.style.opacity = '1';
		});
	}
}

// Enhanced interactions
document.addEventListener('DOMContentLoaded', () => {
	// Initialize the weather app
	const weatherApp = new WeatherApp();

	// Add smooth scrolling for better UX
	document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
		anchor.addEventListener('click', function (e) {
			e.preventDefault();
			const target = document.querySelector(this.getAttribute('href'));
			if (target) {
				target.scrollIntoView({
					behavior: 'smooth',
					block: 'start',
				});
			}
		});
	});

	// Add keyboard navigation
	document.addEventListener('keydown', (e) => {
		if (e.key === '/' && e.ctrlKey) {
			e.preventDefault();
			document.getElementById('location-input').focus();
		}
	});

	// Add loading animations to cards
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -50px 0px',
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				AnimationUtils.slideIn(entry.target);
				observer.unobserve(entry.target);
			}
		});
	}, observerOptions);

	// Observe weather cards for animation
	document.querySelectorAll('.weather-card, .forecast').forEach((card) => {
		observer.observe(card);
	});

	// Add ripple effect to buttons
	document.querySelectorAll('button').forEach((button) => {
		button.addEventListener('click', function (e) {
			const ripple = document.createElement('span');
			const rect = this.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height);
			const x = e.clientX - rect.left - size / 2;
			const y = e.clientY - rect.top - size / 2;

			ripple.style.width = ripple.style.height = size + 'px';
			ripple.style.left = x + 'px';
			ripple.style.top = y + 'px';
			ripple.classList.add('ripple');

			this.appendChild(ripple);

			setTimeout(() => {
				ripple.remove();
			}, 600);
		});
	});
});

// Add ripple effect CSS
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    button {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);
