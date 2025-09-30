import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Have I Been To - Interactive Travel Tracking'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #5059FE 0%, #4048ed 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          padding: '80px',
        }}
      >
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: 20,
            textAlign: 'center',
          }}
        >
          Have I Been To
        </div>
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            textAlign: 'center',
            maxWidth: '900px',
          }}
        >
          Track and visualize the countries you've visited with an interactive 3D globe
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 120,
          }}
        >
          🌍
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}