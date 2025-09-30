import { InteractiveGlobe } from "@/components/app/InteractiveGlobe";

/**
 * Have I Been To - Interactive Globe
 * Main page showing a 3D globe where users can mark visited countries
 */
export default function HomePage() {
  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Have I Been To',
    description: 'Track and visualize the countries you\'ve visited with an interactive 3D globe',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Interactive 3D globe visualization',
      'Track visited countries',
      'Travel statistics and analytics',
      'Country information and data',
      'Visual travel history',
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex-1 h-full min-h-[calc(100vh-64px)]">
        <InteractiveGlobe />
      </div>
    </>
  );
}