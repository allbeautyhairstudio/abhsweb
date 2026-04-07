import { ImageResponse } from 'next/og';

// Cache fonts across requests
let playfairBold: ArrayBuffer | null = null;
let interRegular: ArrayBuffer | null = null;
let interSemiBold: ArrayBuffer | null = null;

async function loadFonts() {
  if (!playfairBold) {
    playfairBold = await fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v37/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKd3vUDQZNLo_U2r.woff2'
    ).then((res) => res.arrayBuffer());
  }
  if (!interRegular) {
    interRegular = await fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
    ).then((res) => res.arrayBuffer());
  }
  if (!interSemiBold) {
    interSemiBold = await fetch(
      'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2'
    ).then((res) => res.arrayBuffer());
  }
  return { playfairBold, interRegular, interSemiBold };
}

export async function createOgImage(pageName: string, tagline: string) {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #FAF6F2 0%, #FFF8F0 50%, #FAF6F2 100%)',
          padding: '60px 80px',
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            width: '120px',
            height: '3px',
            background: '#A0714E',
            marginBottom: '40px',
          }}
        />

        {/* Karli Rosario */}
        <div
          style={{
            fontFamily: 'Playfair Display',
            fontSize: '52px',
            fontWeight: 700,
            color: '#3D3229',
            marginBottom: '8px',
          }}
        >
          Karli Rosario
        </div>

        {/* Intentional Hair Design */}
        <div
          style={{
            fontFamily: 'Inter',
            fontSize: '22px',
            fontWeight: 400,
            color: '#756458',
            letterSpacing: '2px',
            textTransform: 'uppercase' as const,
            marginBottom: '32px',
          }}
        >
          Intentional Hair Design
        </div>

        {/* Divider */}
        <div
          style={{
            width: '280px',
            height: '1px',
            background: '#E3D9D0',
            marginBottom: '32px',
          }}
        />

        {/* Page name */}
        <div
          style={{
            fontFamily: 'Inter',
            fontSize: '32px',
            fontWeight: 600,
            color: '#3F5A37',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ color: '#A0714E', fontSize: '20px' }}>&#10022;</span>
          {pageName}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontFamily: 'Inter',
            fontSize: '20px',
            fontWeight: 400,
            color: '#756458',
            textAlign: 'center',
            maxWidth: '600px',
            lineHeight: '1.5',
          }}
        >
          {tagline}
        </div>

        {/* Bottom section */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'Inter',
              fontSize: '14px',
              fontWeight: 400,
              color: '#9F8E80',
              letterSpacing: '1px',
            }}
          >
            allbeautyhairstudio.com
          </div>
          <div
            style={{
              width: '120px',
              height: '3px',
              background: '#A0714E',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Playfair Display', data: fonts.playfairBold!, weight: 700 as const, style: 'normal' as const },
        { name: 'Inter', data: fonts.interRegular!, weight: 400 as const, style: 'normal' as const },
        { name: 'Inter', data: fonts.interSemiBold!, weight: 600 as const, style: 'normal' as const },
      ],
    }
  );
}
