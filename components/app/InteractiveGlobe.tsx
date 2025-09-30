'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { getLocalVisitedCountryCodes, addLocalVisitedCountry, removeLocalVisitedCountry } from '@/utils/localStorage';

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
    const { data: session } = useSession();
    const isAuthenticated = !!session?.user;

    const [countries, setCountries] = useState<any>({ features: [] });
    const [visitedCountries, setVisitedCountries] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const globeRef = useRef<any>(null);

    // Load GeoJSON data and visited countries
    useEffect(() => {
        // Load world countries GeoJSON
        fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
            .then((res) => res.json())
            .then((data) => {
                setCountries(data);
            });
    }, []);

    // Load visited countries after countries data is loaded
    useEffect(() => {
        if (countries.features.length > 0) {
            loadVisitedCountries();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [countries, isAuthenticated]);

    const loadVisitedCountries = async () => {
        try {
            if (isAuthenticated) {
                // Load from server for authenticated users
                const response = await fetch('/api/countries');
                const data = await response.json();

                if (data.countries) {
                    const codes = new Set<string>(data.countries.map((c: VisitedCountry) => c.country_code));
                    setVisitedCountries(codes);
                }
            } else {
                // Load from localStorage for unauthenticated users
                const localCodes = getLocalVisitedCountryCodes();
                setVisitedCountries(localCodes);
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

        if (isAuthenticated) {
            // Authenticated: use server API
            try {
                if (isVisited) {
                    // Remove country
                    const response = await fetch(`/api/countries?country_code=${countryCode}`, {
                        method: 'DELETE',
                    });

                    if (response.ok) {
                        setVisitedCountries((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(countryCode);
                            return newSet;
                        });
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
                        setVisitedCountries((prev) => new Set([...prev, countryCode]));
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
        } else {
            // Not authenticated: use localStorage and prompt to sign in
            try {
                if (isVisited) {
                    // Remove from localStorage
                    if (removeLocalVisitedCountry(countryCode)) {
                        setVisitedCountries((prev) => {
                            const newSet = new Set(prev);
                            newSet.delete(countryCode);
                            return newSet;
                        });
                        setTimeout(() => setSelectedCountry(null), 300);
                        toast.success(`${countryName} removed`);
                    }
                } else {
                    // Add to localStorage
                    if (addLocalVisitedCountry(countryCode, countryName)) {
                        setVisitedCountries((prev) => new Set([...prev, countryCode]));
                        setTimeout(() => setSelectedCountry(null), 300);

                        // Show toast with sign-in prompt
                        toast.success(`${countryName} added! Sign Up (for free) to save your countries forever.`, {
                            duration: 5000,
                            icon: '🌍',
                        });
                    }
                }
            } catch (error) {
                console.error('Error toggling country:', error);
                toast.error('Failed to update country');
            }
        }
    };

    const handlePolygonClick = (polygon: any) => {
        const country = polygon as Country;
        const countryCode = country.properties.ISO_A2;
        const countryName = country.properties.NAME;

        if (countryCode && countryName) {
            setSelectedCountry(countryCode);
            toggleCountry(countryCode, countryName);
        }
    };

    const getPolygonColor = (polygon: any) => {
        const country = polygon as Country;
        const countryCode = country.properties.ISO_A2;
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

    const getPolygonStrokeColor = (polygon: any) => {
        const country = polygon as Country;
        const countryCode = country.properties.ISO_A2;

        if (visitedCountries.has(countryCode)) {
            return 'rgba(34, 197, 94, 1)'; // Green outline for visited
        }

        return '#111'; // Default dark outline
    };

    const getPolygonAltitude = (polygon: any) => {
        const country = polygon as Country;
        const countryCode = country.properties.ISO_A2;
        return visitedCountries.has(countryCode) ? 0.02 : 0.01;
    };

    // Convert ISO alpha-2 country code to flag emoji
    const getCountryFlag = (countryCode: string) => {
        if (!countryCode || countryCode.length !== 2) return '';

        // Convert country code to regional indicator symbols
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map((char) => 127397 + char.charCodeAt(0));

        return String.fromCodePoint(...codePoints);
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center h-full'>
                <div className='text-gray-600'>Loading globe...</div>
            </div>
        );
    }

    return (
        <div className='relative w-full h-full'>
            <div className='absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg'>
                <h2 className='text-lg font-semibold mb-2'>Have I Been To</h2>
                <div className='space-y-2 text-sm'>
                    <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded bg-green-500'></div>
                        <span>Visited ({visitedCountries.size})</span>
                    </div>
                    <div className='flex items-center gap-2'>
                        <div className='w-4 h-4 rounded bg-gray-300'></div>
                        <span>Not visited ({countries.features.length - visitedCountries.size})</span>
                    </div>
                </div>
                <p className='text-xs text-gray-500 mt-3'>Click on countries to mark them as visited</p>
            </div>

            <div className='absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg'>
                <p className='text-xs text-gray-600'>
                    Made by{' '}
                    <a
                        href='https://instagram.com/ofabioroma'
                        target='_blank'
                        rel='noopener noreferrer'
                        className='font-semibold text-blue-600 hover:text-blue-700 transition-colors'
                    >
                        @ofabioroma
                    </a>
                </p>
            </div>

            <Globe
                ref={globeRef}
                globeImageUrl='//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
                backgroundImageUrl='//unpkg.com/three-globe/example/img/night-sky.png'
                polygonsData={countries.features}
                polygonCapColor={getPolygonColor}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
                polygonStrokeColor={getPolygonStrokeColor}
                polygonAltitude={getPolygonAltitude}
                onPolygonClick={handlePolygonClick}
                polygonLabel={(polygon: any) => {
                    const country = polygon as Country;
                    const flag = getCountryFlag(country.properties.ISO_A2);
                    return `
						<div style="background: rgba(0,0,0,0.8); padding: 8px 12px; border-radius: 6px; color: white; font-size: 14px;">
							<div style="display: flex; align-items: center; gap: 8px;">
								<span style="font-size: 24px;">${flag}</span>
								<strong>${country.properties.NAME}</strong>
							</div>
						</div>
					`;
                }}
                animateIn={true}
            />
        </div>
    );
}
