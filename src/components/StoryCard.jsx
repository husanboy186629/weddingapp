import React from 'react';

/**
 * StoryCard — Instagram Story uchun 1080×1920 o'lchamdagi maxsus render shabloni.
 * Bu komponent admin panelda har bir tabrikni rasm sifatida eksport qilish uchun ishlatiladi.
 * html-to-image kutubxonasi orqali PNG ga aylantiriladi.
 */
const StoryCard = React.forwardRef(function StoryCard({ wish }, ref) {
  const fullName = `${wish.firstName || ''} ${wish.lastName || ''}`.trim();

  const formatDate = (ts) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* message length → adaptive font size */
  const msgLen = (wish.message || '').length;
  let fontSize = '32px';
  let lineHeight = '1.65';
  if (msgLen > 500) {
    fontSize = '24px';
    lineHeight = '1.55';
  } else if (msgLen > 300) {
    fontSize = '26px';
    lineHeight = '1.6';
  } else if (msgLen > 150) {
    fontSize = '28px';
    lineHeight = '1.6';
  }

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1920px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        /* pastel gradient background */
        background: 'linear-gradient(160deg, #FFF8F0 0%, #FFF0E6 20%, #FFE8EA 45%, #FFF5F5 65%, #FFF8F0 100%)',
      }}
    >
      {/* ── golden border frame ── */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '40px',
          right: '40px',
          bottom: '40px',
          border: '3px solid #D4A04A',
          borderRadius: '24px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '52px',
          left: '52px',
          right: '52px',
          bottom: '52px',
          border: '1px solid rgba(212,160,74,0.4)',
          borderRadius: '20px',
          pointerEvents: 'none',
        }}
      />

      {/* ── corner ornaments ── */}
      {[
        { top: '56px', left: '56px' },
        { top: '56px', right: '56px' },
        { bottom: '56px', left: '56px' },
        { bottom: '56px', right: '56px' },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            ...pos,
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D4A04A',
            fontSize: '28px',
            opacity: 0.7,
          }}
        >
          ✦
        </div>
      ))}

      {/* ── top section: bride & groom ── */}
      <div
        style={{
          position: 'absolute',
          top: '120px',
          left: '0',
          right: '0',
          textAlign: 'center',
        }}
      >
        {/* small decorative text */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '20px',
            letterSpacing: '8px',
            color: '#B8860B',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          To'y Tabriklari
        </p>

        {/* couple names */}
        <h1
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '72px',
            color: '#B8860B',
            lineHeight: '1.2',
            marginBottom: '12px',
          }}
        >
          Aziz & Aziza
        </h1>

        {/* decorative line with heart */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginBottom: '10px',
          }}
        >
          <span style={{ display: 'inline-block', width: '80px', height: '1px', background: 'linear-gradient(to right, transparent, #D4A04A)' }} />
          <span style={{ color: '#E8647C', fontSize: '20px' }}>♥</span>
          <span style={{ display: 'inline-block', width: '80px', height: '1px', background: 'linear-gradient(to left, transparent, #D4A04A)' }} />
        </div>

        {/* date */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '22px',
            color: '#996515',
            letterSpacing: '4px',
          }}
        >
          20 • 10 • 2026
        </p>
      </div>

      {/* ── center: message card ── */}
      <div
        style={{
          position: 'absolute',
          top: '460px',
          left: '80px',
          right: '80px',
          bottom: '360px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* opening quotation mark */}
        <div
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '120px',
            color: '#D4A04A',
            opacity: 0.35,
            lineHeight: '0.6',
            marginBottom: '10px',
          }}
        >
          "
        </div>

        {/* message text */}
        <div
          style={{
            width: '100%',
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize,
              lineHeight,
              color: '#3D2B1F',
              fontStyle: 'italic',
              fontWeight: '500',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
            }}
          >
            {wish.message}
          </p>
        </div>

        {/* closing quotation mark */}
        <div
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '120px',
            color: '#D4A04A',
            opacity: 0.35,
            lineHeight: '0.4',
            marginTop: '10px',
            transform: 'rotate(180deg)',
          }}
        >
          "
        </div>
      </div>

      {/* ── bottom section: sender info ── */}
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '0',
          right: '0',
          textAlign: 'center',
        }}
      >
        {/* divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          <span style={{ display: 'inline-block', width: '100px', height: '1px', background: 'linear-gradient(to right, transparent, #D4A04A)' }} />
          <span style={{ color: '#D4A04A', fontSize: '14px' }}>✦</span>
          <span style={{ display: 'inline-block', width: '100px', height: '1px', background: 'linear-gradient(to left, transparent, #D4A04A)' }} />
        </div>

        {/* label */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '18px',
            color: '#B8860B',
            letterSpacing: '5px',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Yubordi
        </p>

        {/* sender name */}
        <p
          style={{
            fontFamily: "'Great Vibes', cursive",
            fontSize: '48px',
            color: '#B8860B',
            lineHeight: '1.3',
          }}
        >
          {fullName}
        </p>

        {/* timestamp */}
        {wish.createdAt && (
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '16px',
              color: '#996515',
              opacity: 0.7,
              marginTop: '8px',
            }}
          >
            {formatDate(wish.createdAt)}
          </p>
        )}
      </div>

      {/* ── subtle background ornaments ── */}
      <div
        style={{
          position: 'absolute',
          top: '35%',
          left: '-60px',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212,160,74,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '30%',
          right: '-60px',
          width: '240px',
          height: '240px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,100,124,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
});

export default StoryCard;
