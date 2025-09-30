const config = {
	metadata: {
		metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
		title: "Have I Been To",
		description: "Track and visualize the countries you've visited with an interactive 3D globe",
		keywords: ["Travel", "Globe", "Countries", "Visited", "Map", "Interactive", "3D Visualization", "Travel Tracker"],
		authors: [{ name: "Have I Been To" }],
		creator: "Have I Been To",
		publisher: "Have I Been To",
		formatDetection: {
			email: false,
			address: false,
			telephone: false,
		},
		openGraph: {
			type: 'website',
			locale: 'en_US',
			url: '/',
			siteName: 'Have I Been To',
			title: 'Have I Been To - Interactive Travel Tracking',
			description: 'Track and visualize the countries you\'ve visited with an interactive 3D globe',
			images: [
				{
					url: '/opengraph-image',
					width: 1200,
					height: 630,
					alt: 'Have I Been To - Interactive Globe Preview',
				},
			],
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Have I Been To',
			description: 'Track and visualize the countries you\'ve visited with an interactive 3D globe',
			images: ['/opengraph-image'],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: {
				index: true,
				follow: true,
				'max-video-preview': -1,
				'max-image-preview': 'large' as const,
				'max-snippet': -1,
			},
		},
		alternates: {
			canonical: '/',
		},
	},
	theme: {
		colors: {
			primary: '#5059FE',
			primaryHover: '#4048ed',
			border: '#E5E7EB',  // Standard border color
			borderHover: '#D1D5DB'  // Border hover color
		}
	},
	// Stripe configuration (unused - kept for potential future use)
	stripe: {
		free: {
			monthPrice: 0,
			yearPrice: 0,
			monthPriceId: '',
			yearPriceId: '',
			productId: '',
			name: 'Free',
			description: 'Free plan',
		},
		basic: {
			monthPrice: 9.9,
			yearPrice: 90,
			monthPriceId: 'price_1QrDN5LftJls1Qmt6yKw9Jc1',
			yearPriceId: 'price_1QvXPGLftJls1Qmtv5WDcyEx',
			productId: 'prod_RkioMb0SBidBEm',
			name: 'Basic',
			description: 'Basic plan',
		},
		pro: {
			monthPrice: 29.9,
			yearPrice: 280,
			monthPriceId: 'price_1QuociLftJls1QmtLkO3yTap',
			yearPriceId: 'price_1QvXQaLftJls1Qmt8WU8blWx',
			productId: 'prod_RoRVnNIOef31KY',
			name: 'Pro',
			description: 'Pro plan',
		},
	},
	appName: "Have I Been To",
	socialLinks: {
		github: "https://github.com",
		twitter: "https://twitter.com",
		linkedin: "https://linkedin.com"
	},
	emailProvider: "nodemailer",
};


export default config;