const config = {
	metadata: {
		title: "Saas Starter",
		description: "Saas Starter Kit for demo purpose ",
		keywords: ["Saas", "Starter Kit", "Demo", "Note Taking", "AI", "Chatbot"],
	},
	theme: {
		colors: {
			primary: '#5059FE',
			primaryHover: '#4048ed',
			border: '#E5E7EB',  // Standard border color
			borderHover: '#D1D5DB'  // Border hover color
		}
	},
	// Add stripe plan
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
	appName: "saas starter kit",
	socialLinks: {
		github: "https://github.com",
		twitter: "https://twitter.com",
		linkedin: "https://linkedin.com"
	},
	emailProvider: "nodemailer",
};


export default config;