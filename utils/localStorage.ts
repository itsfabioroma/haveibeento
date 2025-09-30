/**
 * Local Storage Utility for Visited Countries
 * Manages country visits for unauthenticated users
 */

const STORAGE_KEY = 'haveibeento_visited_countries';

export interface LocalVisitedCountry {
	country_code: string;
	country_name: string;
	visited_date: string;
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
	try {
		const test = '__localStorage_test__';
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

/**
 * Get all visited countries from localStorage
 */
export function getLocalVisitedCountries(): LocalVisitedCountry[] {
	if (!isLocalStorageAvailable()) return [];

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (!stored) return [];
		return JSON.parse(stored) as LocalVisitedCountry[];
	} catch (error) {
		console.error('Error reading from localStorage:', error);
		return [];
	}
}

/**
 * Get visited country codes as a Set
 */
export function getLocalVisitedCountryCodes(): Set<string> {
	const countries = getLocalVisitedCountries();
	return new Set(countries.map((c) => c.country_code));
}

/**
 * Add a country to localStorage
 */
export function addLocalVisitedCountry(countryCode: string, countryName: string): boolean {
	if (!isLocalStorageAvailable()) return false;

	try {
		const countries = getLocalVisitedCountries();

		// Check if already exists
		if (countries.some((c) => c.country_code === countryCode)) {
			return false;
		}

		countries.push({
			country_code: countryCode,
			country_name: countryName,
			visited_date: new Date().toISOString(),
		});

		localStorage.setItem(STORAGE_KEY, JSON.stringify(countries));
		return true;
	} catch (error) {
		console.error('Error adding to localStorage:', error);
		return false;
	}
}

/**
 * Remove a country from localStorage
 */
export function removeLocalVisitedCountry(countryCode: string): boolean {
	if (!isLocalStorageAvailable()) return false;

	try {
		const countries = getLocalVisitedCountries();
		const filtered = countries.filter((c) => c.country_code !== countryCode);

		localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
		return true;
	} catch (error) {
		console.error('Error removing from localStorage:', error);
		return false;
	}
}

/**
 * Clear all visited countries from localStorage
 */
export function clearLocalVisitedCountries(): boolean {
	if (!isLocalStorageAvailable()) return false;

	try {
		localStorage.removeItem(STORAGE_KEY);
		return true;
	} catch (error) {
		console.error('Error clearing localStorage:', error);
		return false;
	}
}

/**
 * Check if a country is marked as visited in localStorage
 */
export function isCountryVisitedLocally(countryCode: string): boolean {
	const codes = getLocalVisitedCountryCodes();
	return codes.has(countryCode);
}