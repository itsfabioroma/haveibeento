'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';

// Dynamically import Globe with no SSR
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface VisitedCountry {
	id: number;
	country_code: string;
	country_name: string;
	visited_date: string;
	notes: string | null;
}

interface Country {
	type: string;
	properties: {
		ISO_A2: string;
		NAME: string;
		POP_EST: number;
	};
	geometry: any;
}

export function InteractiveGlobe() {
	const [countries, setCountries] = useState<any>({ features: [] });
	const [visitedCountries, setVisitedCountries] = useState<Set<string>>(new Set());
	const [loading, setLoading] = useState(true);
	const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
	const globeRef = useRef<any>();

	// Load GeoJSON data and visited countries
	useEffect(() => {
		// Load world countries GeoJSON
		fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
			.then(res => res.json())
			.then(data => {
				setCountries(data);
			});
	}, []);

	// Load visited countries after countries data is loaded
	useEffect(() => {
		if (countries.features.length > 0) {
			loadVisitedCountries();
		}
	}, [countries]);

	const loadVisitedCountries = async () => {
		try {
			const response = await fetch('/api/countries');
			const data = await response.json();

			if (data.countries) {
				const codes = new Set(data.countries.map((c: VisitedCountry) => c.country_code));
				setVisitedCountries(codes);
			}
		} catch (error) {
			console.error('Error loading visited countries:', error);
			toast.error('Failed to load visited countries');
		} finally {
			setLoading(false);
		}
	};

	const toggleCountry = async (countryCode: string, countryName: string) => {
		const isVisited = visitedCountries.has(countryCode);

		try {
			if (isVisited) {
				// Remove country
				const response = await fetch(`/api/countries?country_code=${countryCode}`, {
					method: 'DELETE',
				});

				if (response.ok) {
					setVisitedCountries(prev => {
						const newSet = new Set(prev);
						newSet.delete(countryCode);
						return newSet;
					});
					// Fade out animation
					setTimeout(() => setSelectedCountry(null), 300);
					toast.success(`${countryName} removed`);
				} else {
					throw new Error('Failed to remove country');
				}
			} else {
				// Add country
				const response = await fetch('/api/countries', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						country_code: countryCode,
						country_name: countryName,
					}),
				});

				if (response.ok) {
					setVisitedCountries(prev => new Set([...prev, countryCode]));
					// Fade out animation
					setTimeout(() => setSelectedCountry(null), 300);
					toast.success(`${countryName} marked as visited!`);
				} else {
					throw new Error('Failed to add country');
				}
			}
		} catch (error) {
			console.error('Error toggling country:', error);
			toast.error('Failed to update country');
		}
	};

	const handlePolygonClick = (polygon: Country) => {
		const countryCode = polygon.properties.ISO_A2;
		const countryName = polygon.properties.NAME;

		if (countryCode && countryName) {
			setSelectedCountry(countryCode);
			toggleCountry(countryCode, countryName);
		}
	};

	const getPolygonColor = (polygon: Country) => {
		const countryCode = polygon.properties.ISO_A2;
		const isVisited = visitedCountries.has(countryCode);
		const isSelected = selectedCountry === countryCode;

		if (isVisited && isSelected) {
			return 'rgba(34, 197, 94, 0.5)'; // Brighter glassmorphic green when selected
		}

		if (isVisited) {
			return 'rgba(34, 197, 94, 0.25)'; // Glassmorphic green for visited
		}

		if (isSelected) {
			return 'rgba(200, 200, 200, 0.6)'; // Slightly more visible when selected
		}

		return 'rgba(200, 200, 200, 0.3)'; // Light gray for all countries
	};

	const getPolygonStrokeColor = (polygon: Country) => {
		const countryCode = polygon.properties.ISO_A2;

		if (visitedCountries.has(countryCode)) {
			return 'rgba(34, 197, 94, 1)'; // Green outline for visited
		}

		return '#111'; // Default dark outline
	};

	const getPolygonAltitude = (polygon: Country) => {
		const countryCode = polygon.properties.ISO_A2;
		return visitedCountries.has(countryCode) ? 0.02 : 0.01;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-gray-600">Loading globe...</div>
			</div>
		);
	}

	return (
		<div className="relative w-full h-full">
			<div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
				<h2 className="text-lg font-semibold mb-2">Have I Been To</h2>
				<div className="space-y-2 text-sm">
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded bg-green-500"></div>
						<span>Visited ({visitedCountries.size})</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="w-4 h-4 rounded bg-gray-300"></div>
						<span>Not visited ({countries.features.length - visitedCountries.size})</span>
					</div>
				</div>
				<p className="text-xs text-gray-500 mt-3">
					Click on countries to mark them as visited
				</p>
			</div>

			<Globe
				ref={globeRef}
				globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
				backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
				polygonsData={countries.features}
				polygonCapColor={getPolygonColor}
				polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
				polygonStrokeColor={getPolygonStrokeColor}
				polygonAltitude={getPolygonAltitude}
				onPolygonClick={handlePolygonClick}
				polygonLabel={({ properties }: Country) => `
					<div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 4px; color: white;">
						<strong>${properties.NAME}</strong>
					</div>
				`}
				animateIn={true}
			/>
		</div>
	);
}