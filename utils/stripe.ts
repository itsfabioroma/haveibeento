import Stripe from 'stripe';

// Only initialize Stripe if the secret key is configured
export const stripe = process.env.STRIPE_SECRET_KEY
	? new Stripe(process.env.STRIPE_SECRET_KEY, {
		apiVersion: "2025-01-27.acacia",
		typescript: true,
	})
	: null;