import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
    width: 192,
    height: 192,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
    return new ImageResponse(
        (
            // ImageResponse JSX element
            <div
                style={{
                    fontSize: 132,
                    background: '#059669',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '44px',
                    fontWeight: 900,
                    boxShadow: '0 0 40px rgba(5, 150, 105, 0.3)',
                }}
            >
                M
            </div>
        ),
        {
            ...size,
        }
    )
}
