import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getLocalVisitedCountries, clearLocalVisitedCountries } from '@/utils/localStorage';
import { toast } from 'react-hot-toast';

/**
 * Hook to automatically sync localStorage countries to server when user authenticates
 */
export function useAuthSync() {
	const { data: session, status } = useSession();
	const hasRunSync = useRef(false);
	const previousAuthState = useRef(false);

	useEffect(() => {
		const isAuthenticated = !!session?.user;
		const wasAuthenticated = previousAuthState.current;

		// Detect transition from unauthenticated to authenticated
		if (isAuthenticated && !wasAuthenticated && !hasRunSync.current && status !== 'loading') {
			syncLocalToServer();
			hasRunSync.current = true;
		}

		previousAuthState.current = isAuthenticated;
	}, [session, status]);

	const syncLocalToServer = async () => {
		try {
			const localCountries = getLocalVisitedCountries();

			if (localCountries.length === 0) {
				return; // Nothing to sync
			}

			// Sync to server
			const response = await fetch('/api/countries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					countries: localCountries,
				}),
			});

			if (!response.ok) {
				throw new Error('Failed to sync countries');
			}

			const result = await response.json();

			// Clear localStorage after successful sync
			clearLocalVisitedCountries();

			// Show success toast
			const syncedCount = result.synced || localCountries.length;
			if (syncedCount > 0) {
				toast.success(`${syncedCount} ${syncedCount === 1 ? 'country' : 'countries'} synced to your account!`);
			}
		} catch (error) {
			console.error('Error syncing countries:', error);
			toast.error('Failed to sync your countries. Please try again.');
		}
	};
}