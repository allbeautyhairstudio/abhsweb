/**
 * Botanical line-art SVG accents inspired by Karli's brand.
 * Hand-drawn style with stroke-based paths — recognizable flowers,
 * leaves, and stems. Subtle but adds visual warmth and personality.
 */

interface AccentProps {
  className?: string;
  withVines?: boolean;
}

/**
 * Hand-illustrated garden rose bloom.
 * Layered petals curl and overlap like a real cabbage rose opening.
 * Each petal has its own curve weight and opacity for depth.
 * Stamen, pistil, sepals, and companion leaves complete the botanical.
 */
export function FloralBloom({ className = '' }: AccentProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* === OUTERMOST PETALS (guard petals) -- wide, soft, slightly curled edges === */}
      {/* Top guard */}
      <path d="M40 6 C32 10 26 18 25 26 C28 20 34 14 40 12 C46 14 52 20 55 26 C54 18 48 10 40 6z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      {/* Top-right guard */}
      <path d="M56 10 C60 16 62 24 58 32 C56 26 52 20 48 18 C52 14 56 12 56 10z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.25" />
      {/* Right guard */}
      <path d="M66 24 C68 32 66 40 60 46 C62 40 60 32 56 28 C60 26 64 24 66 24z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.25" />
      {/* Bottom-right guard */}
      <path d="M62 50 C58 58 50 62 44 60 C50 56 54 50 54 44 C58 46 62 48 62 50z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.25" />
      {/* Bottom guard */}
      <path d="M40 68 C48 64 54 58 55 50 C52 56 46 60 40 62 C34 60 28 56 25 50 C26 58 32 64 40 68z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.28" />
      {/* Bottom-left guard */}
      <path d="M18 50 C22 58 30 62 36 60 C30 56 26 50 26 44 C22 46 18 48 18 50z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.25" />
      {/* Left guard */}
      <path d="M14 24 C12 32 14 40 20 46 C18 40 20 32 24 28 C20 26 16 24 14 24z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.25" />
      {/* Top-left guard */}
      <path d="M24 10 C20 16 18 24 22 32 C24 26 28 20 32 18 C28 14 24 12 24 10z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.25" />

      {/* === MIDDLE PETALS -- cupped inward, more visible === */}
      {/* Top */}
      <path d="M40 14 C34 18 30 24 30 30 C34 24 38 20 40 18 C42 20 46 24 50 30 C50 24 46 18 40 14z"
        stroke="currentColor" strokeWidth="0.75" opacity="0.38" />
      {/* Right */}
      <path d="M58 30 C54 26 48 24 42 26 C48 28 52 32 54 36 C54 32 56 30 58 30z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
      {/* Bottom */}
      <path d="M40 58 C46 54 50 48 50 42 C46 48 42 52 40 54 C38 52 34 48 30 42 C30 48 34 54 40 58z"
        stroke="currentColor" strokeWidth="0.75" opacity="0.38" />
      {/* Left */}
      <path d="M22 30 C26 26 32 24 38 26 C32 28 28 32 26 36 C26 32 24 30 22 30z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
      {/* Diagonal petals for fullness */}
      <path d="M50 18 C52 24 50 30 46 34 C48 28 48 22 50 18z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.32" />
      <path d="M30 18 C28 24 30 30 34 34 C32 28 32 22 30 18z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.32" />
      <path d="M50 54 C52 48 50 42 46 38 C48 44 48 50 50 54z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.32" />
      <path d="M30 54 C28 48 30 42 34 38 C32 44 32 50 30 54z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.32" />

      {/* === INNER PETALS -- tight, spiraling toward center === */}
      <path d="M40 24 C36 26 34 30 35 34 C37 30 39 28 40 26 C41 28 43 30 45 34 C46 30 44 26 40 24z"
        stroke="currentColor" strokeWidth="0.8" opacity="0.45" />
      <path d="M46 30 C44 28 42 28 40 30 C42 30 44 32 46 34 C46 32 46 30 46 30z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.42" />
      <path d="M34 30 C36 28 38 28 40 30 C38 30 36 32 34 34 C34 32 34 30 34 30z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.42" />
      <path d="M40 44 C44 42 46 38 44 34 C42 38 40 40 40 42 C40 40 38 38 36 34 C34 38 36 42 40 44z"
        stroke="currentColor" strokeWidth="0.8" opacity="0.45" />

      {/* === CENTER SPIRAL -- the tight bud at the heart === */}
      <path d="M38 33 C37 31 38 29 40 29 C42 29 43 31 42 33 C41 35 39 35 38 33z"
        stroke="currentColor" strokeWidth="0.8" opacity="0.55" />
      <path d="M39 31 C39 30 40 29.5 41 30 C41.5 31 41 32 40 32 C39 32 39 31 39 31z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.6" />

      {/* === STAMEN -- tiny dots and filaments at center === */}
      <circle cx="39.5" cy="31" r="0.7" fill="currentColor" opacity="0.5" />
      <circle cx="40.8" cy="32" r="0.5" fill="currentColor" opacity="0.45" />
      <circle cx="39" cy="32.5" r="0.4" fill="currentColor" opacity="0.4" />
      <circle cx="41" cy="30.5" r="0.4" fill="currentColor" opacity="0.35" />

      {/* === SEPALS -- pointed leaf-shapes peeking from behind the bloom === */}
      <path d="M30 8 C28 4 26 2 24 1 C26 4 28 7 30 10"
        stroke="currentColor" strokeWidth="0.5" opacity="0.22" strokeLinecap="round" />
      <path d="M50 8 C52 4 54 2 56 1 C54 4 52 7 50 10"
        stroke="currentColor" strokeWidth="0.5" opacity="0.22" strokeLinecap="round" />
      <path d="M62 20 C66 18 68 16 70 14 C66 18 64 20 62 22"
        stroke="currentColor" strokeWidth="0.45" opacity="0.2" strokeLinecap="round" />
      <path d="M18 20 C14 18 12 16 10 14 C14 18 16 20 18 22"
        stroke="currentColor" strokeWidth="0.45" opacity="0.2" strokeLinecap="round" />

      {/* === COMPANION LEAVES -- reaching out from stem area === */}
      {/* Lower-left leaf with midrib and veins */}
      <path d="M14 62 C10 56 8 48 12 42 C14 48 18 54 22 58 C18 60 14 62 14 62z"
        stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <path d="M14 62 C12 54 12 46 14 42" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
      <path d="M13 52 C15 50 17 52" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />
      <path d="M13 48 C15 46 17 48" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />
      {/* Stem connecting to leaf */}
      <path d="M22 58 C26 56 30 52 34 46" stroke="currentColor" strokeWidth="0.5" opacity="0.25" strokeLinecap="round" />

      {/* Lower-right leaf */}
      <path d="M66 62 C70 56 72 48 68 42 C66 48 62 54 58 58 C62 60 66 62 66 62z"
        stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <path d="M66 62 C68 54 68 46 66 42" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
      <path d="M67 52 C65 50 63 52" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />
      <path d="M67 48 C65 46 63 48" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />
      <path d="M58 58 C54 56 50 52 46 46" stroke="currentColor" strokeWidth="0.5" opacity="0.25" strokeLinecap="round" />

      {/* === POLLEN SCATTER === */}
      <circle cx="20" cy="20" r="0.5" fill="currentColor" opacity="0.15" />
      <circle cx="60" cy="20" r="0.5" fill="currentColor" opacity="0.15" />
      <circle cx="16" cy="36" r="0.4" fill="currentColor" opacity="0.12" />
      <circle cx="64" cy="36" r="0.4" fill="currentColor" opacity="0.12" />
      <circle cx="28" cy="64" r="0.4" fill="currentColor" opacity="0.12" />
      <circle cx="52" cy="64" r="0.4" fill="currentColor" opacity="0.12" />
    </svg>
  );
}

/** Horizontal botanical vine divider — replaces plain <hr> elements */
export function FloralDivider({ className = '' }: AccentProps) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="h-px flex-1 bg-current opacity-30" />
      <svg
        viewBox="0 0 600 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-2xl h-10 shrink-0"
        aria-hidden="true"
      >
        {/* Far left vine extension */}
        <path
          d="M0 20 Q20 20 40 19 Q60 18 80 19 Q100 20 120 19"
          stroke="currentColor" strokeWidth="0.8" opacity="0.45"
          strokeLinecap="round"
        />
        {/* Far left scattered leaves */}
        <path d="M30 19 Q26 13 29 9" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M30 19 Q23 15 22 10" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        <path d="M30 19 Q26 13 22 10" stroke="currentColor" strokeWidth="0.4" opacity="0.3" fill="none" />
        <path d="M70 18 Q67 13 69 9" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <path d="M70 18 Q73 13 71 9" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
        {/* Far left bud */}
        <path d="M105 19 Q103 14 105 11 Q107 14 105 19z" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />

        {/* Left vine stem into center */}
        <path
          d="M120 19 Q150 18 175 19 Q200 20 225 19 Q250 18 270 20"
          stroke="currentColor" strokeWidth="0.9" opacity="0.5"
          strokeLinecap="round"
        />
        {/* Left leaf pair */}
        <path d="M155 18 Q150 11 153 7" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
        <path d="M155 18 Q147 13 145 8" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
        <path d="M155 18 Q150 11 145 8" stroke="currentColor" strokeWidth="0.5" opacity="0.3" fill="none" />
        {/* Left small leaf */}
        <path d="M195 19 Q192 13 194 9" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M195 19 Q198 13 196 9" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        {/* Left bud */}
        <path d="M235 18 Q233 13 235 10 Q237 13 235 18z" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M235 18 Q231 16 229 12" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />

        {/* Center rose — larger and bolder */}
        <circle cx="300" cy="20" r="3.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6" />
        <path d="M300 12 Q296 16 297.5 20 Q300 15 300 12z" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
        <path d="M300 12 Q304 16 302.5 20 Q300 15 300 12z" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
        <path d="M292 18 Q296 15.5 300 18 Q296 20.5 292 18z" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
        <path d="M308 18 Q304 15.5 300 18 Q304 20.5 308 18z" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
        <path d="M300 28 Q296 24 297.5 20 Q300 25 300 28z" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M300 28 Q304 24 302.5 20 Q300 25 300 28z" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        {/* Rose side leaves */}
        <path d="M289 24 Q285 19 287 15" stroke="currentColor" strokeWidth="0.5" opacity="0.45" />
        <path d="M289 24 Q283 21 282 17" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <path d="M311 24 Q315 19 313 15" stroke="currentColor" strokeWidth="0.5" opacity="0.45" />
        <path d="M311 24 Q317 21 318 17" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />

        {/* Right vine stem from center */}
        <path
          d="M330 20 Q350 18 375 19 Q400 20 425 19 Q450 18 480 19"
          stroke="currentColor" strokeWidth="0.9" opacity="0.5"
          strokeLinecap="round"
        />
        {/* Right bud */}
        <path d="M365 18 Q363 13 365 10 Q367 13 365 18z" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M365 18 Q369 16 371 12" stroke="currentColor" strokeWidth="0.4" opacity="0.35" />
        {/* Right small leaf */}
        <path d="M405 19 Q402 13 404 9" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M405 19 Q408 13 406 9" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        {/* Right leaf pair */}
        <path d="M445 18 Q450 11 447 7" stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
        <path d="M445 18 Q453 13 455 8" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />
        <path d="M445 18 Q450 11 455 8" stroke="currentColor" strokeWidth="0.5" opacity="0.3" fill="none" />

        {/* Far right vine extension */}
        <path
          d="M480 19 Q500 20 520 19 Q540 18 560 19 Q580 20 600 20"
          stroke="currentColor" strokeWidth="0.8" opacity="0.45"
          strokeLinecap="round"
        />
        {/* Far right bud */}
        <path d="M495 19 Q493 14 495 11 Q497 14 495 19z" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        {/* Far right scattered leaves */}
        <path d="M530 18 Q527 13 529 9" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
        <path d="M530 18 Q533 13 531 9" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
        <path d="M570 19 Q574 13 571 9" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
        <path d="M570 19 Q577 15 578 10" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        <path d="M570 19 Q574 13 578 10" stroke="currentColor" strokeWidth="0.4" opacity="0.3" fill="none" />

        {/* Tiny pollen dots for detail */}
        <circle cx="140" cy="14" r="0.8" fill="currentColor" opacity="0.3" />
        <circle cx="260" cy="14" r="0.7" fill="currentColor" opacity="0.28" />
        <circle cx="340" cy="14" r="0.7" fill="currentColor" opacity="0.28" />
        <circle cx="460" cy="14" r="0.8" fill="currentColor" opacity="0.3" />
      </svg>
      <div className="h-px flex-1 bg-current opacity-30" />
    </div>
  );
}

/**
 * Corner botanical arrangement -- a lush cascade of roses, buds, leaves,
 * and trailing vines flowing from the corner. Studio-quality botanical illustration.
 */
export function FloralCorner({ className = '', withVines = false }: AccentProps) {
  return (
    <svg
      viewBox={withVines ? '0 0 180 180' : '0 0 130 130'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* === STEMS -- organic curves flowing from corner === */}
      {/* Primary branch -- thick, confident, sweeping arc */}
      <path d="M5 125 C12 105 18 90 28 75 C38 60 48 48 62 38 C72 30 82 24 90 20"
        stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />
      {/* Secondary branch -- diverges mid-way, curves differently */}
      <path d="M5 125 C15 110 30 98 45 88 C60 78 75 72 92 68 C104 65 112 64 118 62"
        stroke="currentColor" strokeWidth="0.75" opacity="0.35" strokeLinecap="round" />
      {/* Tertiary wisp -- short, delicate */}
      <path d="M5 125 C8 118 14 112 22 108 C30 104 40 102 52 102"
        stroke="currentColor" strokeWidth="0.5" opacity="0.28" strokeLinecap="round" />
      {/* Thin accent stem */}
      <path d="M5 125 C10 120 18 118 28 118 C36 118 42 116 48 112"
        stroke="currentColor" strokeWidth="0.4" opacity="0.22" strokeLinecap="round" />

      {/* === PRIMARY ROSE -- full bloom at top of main branch === */}
      {/* Outer petals */}
      <path d="M90 8 C84 12 80 18 80 22 C84 18 88 14 90 12 C92 14 96 18 100 22 C100 18 96 12 90 8z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.38" />
      <path d="M78 16 C76 20 76 26 80 30 C78 26 78 20 78 16z"
        stroke="currentColor" strokeWidth="0.6" opacity="0.32" />
      <path d="M102 16 C104 20 104 26 100 30 C102 26 102 20 102 16z"
        stroke="currentColor" strokeWidth="0.6" opacity="0.32" />
      <path d="M90 34 C86 32 82 28 80 24 C82 28 86 30 90 32 C94 30 98 28 100 24 C98 28 94 32 90 34z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.38" />
      {/* Mid petals */}
      <path d="M90 12 C87 16 85 20 86 24 C88 20 90 16 90 14 C90 16 92 20 94 24 C95 20 93 16 90 12z"
        stroke="currentColor" strokeWidth="0.75" opacity="0.45" />
      <path d="M84 18 C82 22 84 26 88 26 C86 24 84 20 84 18z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.4" />
      <path d="M96 18 C98 22 96 26 92 26 C94 24 96 20 96 18z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.4" />
      {/* Center spiral */}
      <path d="M88 20 C88 18 89 17 90 17.5 C91.5 18 92 20 91 21.5 C90 23 88 22 88 20z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.55" />
      <circle cx="89.8" cy="20" r="0.6" fill="currentColor" opacity="0.5" />
      <circle cx="90.5" cy="21" r="0.4" fill="currentColor" opacity="0.4" />
      {/* Rose leaves flanking the bloom */}
      <path d="M76 28 C72 24 70 18 72 14 C74 20 76 24 78 26"
        stroke="currentColor" strokeWidth="0.55" opacity="0.3" />
      <path d="M76 28 C70 24 68 18 70 14" stroke="currentColor" strokeWidth="0.35" opacity="0.2" />
      <path d="M74 22 C76 20 78 22" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />

      {/* === SECONDARY BUD -- half-open, on the secondary branch === */}
      <path d="M118 54 C116 50 116 46 118 42 C120 46 120 50 118 54z"
        stroke="currentColor" strokeWidth="0.65" opacity="0.4" />
      <path d="M118 42 C114 46 114 50 116 54" stroke="currentColor" strokeWidth="0.55" opacity="0.35" />
      <path d="M118 42 C122 46 122 50 120 54" stroke="currentColor" strokeWidth="0.55" opacity="0.35" />
      {/* Bud sepal */}
      <path d="M116 56 C114 54 112 50 114 46" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
      <path d="M120 56 C122 54 124 50 122 46" stroke="currentColor" strokeWidth="0.4" opacity="0.25" />

      {/* === SMALL BUD -- tight, near secondary branch end === */}
      <path d="M98 64 C96 60 96 56 98 53 C100 56 100 60 98 64z"
        stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <path d="M96 64 C94 62 94 58 96 56" stroke="currentColor" strokeWidth="0.35" opacity="0.25" />

      {/* === LEAVES -- full botanical detail with veins === */}
      {/* Large leaf on main branch */}
      <path d="M35 68 C28 60 26 50 30 44 C32 52 36 60 40 64 C38 66 36 68 35 68z"
        stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      <path d="M35 68 C30 58 30 50 32 44" stroke="currentColor" strokeWidth="0.35" opacity="0.22" />
      <path d="M32 56 C34 54 36 56" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />
      <path d="M31 52 C33 50 35 52" stroke="currentColor" strokeWidth="0.25" opacity="0.15" />

      {/* Paired leaf on main branch */}
      <path d="M50 52 C44 46 42 38 46 32 C48 40 52 46 54 50"
        stroke="currentColor" strokeWidth="0.55" opacity="0.32" />
      <path d="M50 52 C46 44 46 38 48 32" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

      {/* Leaf on secondary branch */}
      <path d="M65 80 C58 76 54 70 58 64 C60 72 64 76 68 78"
        stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M65 80 C60 74 58 68 60 64" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

      {/* Small leaves on secondary */}
      <path d="M82 72 C78 68 78 64 80 60 C82 66 84 70 86 72"
        stroke="currentColor" strokeWidth="0.45" opacity="0.28" />

      {/* Leaves on tertiary wisp */}
      <path d="M28 106 C24 102 24 98 26 94 C28 100 30 104 32 106"
        stroke="currentColor" strokeWidth="0.4" opacity="0.25" />
      <path d="M42 100 C38 96 38 92 40 88 C42 94 44 98 46 100"
        stroke="currentColor" strokeWidth="0.4" opacity="0.25" />

      {/* Tiny leaf on accent stem */}
      <path d="M36 116 C34 112 36 108 C38 112 36 116z"
        stroke="currentColor" strokeWidth="0.35" opacity="0.2" />

      {/* === CURLING TENDRILS -- thin, spiraling, alive === */}
      <path d="M72 32 C76 28 82 26 86 28" stroke="currentColor" strokeWidth="0.35" opacity="0.2" strokeLinecap="round" />
      <path d="M108 60 C112 56 116 58 114 62 C112 64 108 62 108 60"
        stroke="currentColor" strokeWidth="0.35" opacity="0.2" strokeLinecap="round" />
      <path d="M52 95 C56 90 60 92 58 96"
        stroke="currentColor" strokeWidth="0.3" opacity="0.18" strokeLinecap="round" />

      {/* === POLLEN SCATTER === */}
      <circle cx="80" cy="38" r="0.7" fill="currentColor" opacity="0.2" />
      <circle cx="105" cy="50" r="0.5" fill="currentColor" opacity="0.18" />
      <circle cx="60" cy="55" r="0.6" fill="currentColor" opacity="0.18" />
      <circle cx="45" cy="78" r="0.5" fill="currentColor" opacity="0.15" />
      <circle cx="95" cy="72" r="0.4" fill="currentColor" opacity="0.15" />
      <circle cx="35" cy="90" r="0.4" fill="currentColor" opacity="0.12" />

      {withVines && (
        <>
          {/* Extended vine from primary branch -- crawls outward with curls */}
          <path d="M92 18 C100 12 112 10 125 14 C135 18 140 24 148 20 C155 16 162 18 168 22"
            stroke="currentColor" strokeWidth="0.5" opacity="0.22" strokeLinecap="round" />
          <path d="M125 14 C128 8 126 4 122 2" stroke="currentColor" strokeWidth="0.35" opacity="0.18" strokeLinecap="round" />
          <path d="M148 20 C150 14 148 10 144 8" stroke="currentColor" strokeWidth="0.35" opacity="0.18" strokeLinecap="round" />
          {/* Tiny leaves on extended vine */}
          <path d="M135 18 C132 12 134 8 C136 12 135 18z" stroke="currentColor" strokeWidth="0.35" opacity="0.15" />
          <path d="M160 20 C158 14 160 10 C162 14 160 20z" stroke="currentColor" strokeWidth="0.35" opacity="0.15" />

          {/* Extended vine from secondary -- drops downward with spirals */}
          <path d="M48 112 C42 118 35 125 30 135 C26 145 28 152 22 160 C18 166 14 170 10 175"
            stroke="currentColor" strokeWidth="0.5" opacity="0.22" strokeLinecap="round" />
          <path d="M30 135 C24 132 20 136 22 140" stroke="currentColor" strokeWidth="0.35" opacity="0.18" strokeLinecap="round" />
          <path d="M22 160 C16 158 14 162 16 166" stroke="currentColor" strokeWidth="0.3" opacity="0.15" strokeLinecap="round" />
          {/* Tiny leaves on extended vine */}
          <path d="M26 148 C22 144 24 140 C28 144 26 148z" stroke="currentColor" strokeWidth="0.35" opacity="0.15" />
        </>
      )}
    </svg>
  );
}

/** Scattered small botanical elements — background texture */
export function FloralScatter({ className = '' }: AccentProps) {
  return (
    <svg
      viewBox="0 0 200 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tiny leaf 1 */}
      <path d="M20 30 Q16 24 18 19" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M20 30 Q14 26 13 21" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      {/* Single petal 2 */}
      <path d="M60 20 Q58 15 60 12 Q62 15 60 20z" stroke="currentColor" strokeWidth="0.4" opacity="0.28" />
      {/* Tiny bud 3 */}
      <path d="M100 40 Q98 35 100 32 Q102 35 100 40z" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
      <path d="M100 40 Q97 38 96 35" stroke="currentColor" strokeWidth="0.3" opacity="0.25" />
      {/* Single leaf 4 */}
      <path d="M140 25 Q137 19 139 15" stroke="currentColor" strokeWidth="0.5" opacity="0.28" />
      <path d="M140 25 Q143 19 141 15" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      {/* Dot details */}
      <circle cx="45" cy="42" r="0.8" fill="currentColor" opacity="0.25" />
      <circle cx="120" cy="18" r="0.6" fill="currentColor" opacity="0.22" />
      <circle cx="175" cy="35" r="0.7" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

/** Full-width botanical watercolor background — line-art flowers with soft color washes
 *  Inspired by mural-style botanical wallpaper: blush/sage/grey watercolor blobs
 *  behind delicate line-drawn peonies, leaves, and stems */
export function FloralWatercolorBg({ className = '' }: AccentProps) {
  return (
    <svg
      viewBox="0 0 1200 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* === Watercolor wash blobs === */}
      {/* Top-left blush wash */}
      <ellipse cx="120" cy="80" rx="180" ry="140" fill="#E8C4B8" opacity="0.12" transform="rotate(-15 120 80)" />
      {/* Left-center rose wash */}
      <ellipse cx="80" cy="320" rx="150" ry="120" fill="#D4A292" opacity="0.1" transform="rotate(10 80 320)" />
      {/* Top-right sage wash */}
      <ellipse cx="1050" cy="100" rx="200" ry="160" fill="#C5D1BA" opacity="0.13" transform="rotate(20 1050 100)" />
      {/* Right sage-green wash */}
      <ellipse cx="1100" cy="380" rx="160" ry="130" fill="#4D6C46" opacity="0.1" transform="rotate(-10 1100 380)" />
      {/* Center-bottom soft grey wash */}
      <ellipse cx="600" cy="520" rx="220" ry="100" fill="#C8C0B8" opacity="0.08" transform="rotate(5 600 520)" />
      {/* Small blush accent near center */}
      <circle cx="350" cy="450" r="80" fill="#E0B8A8" opacity="0.08" />
      {/* Top center green wash */}
      <ellipse cx="500" cy="30" rx="120" ry="60" fill="#4D6C46" opacity="0.12" />

      {/* === Top-left large peony (line art) === */}
      <g opacity="0.3" stroke="#976A5B" strokeLinecap="round">
        {/* Outer petals */}
        <path d="M60 120 Q30 80 55 40 Q80 70 70 100" strokeWidth="1.2" />
        <path d="M55 40 Q90 20 120 45 Q90 55 70 100" strokeWidth="1.2" />
        <path d="M120 45 Q150 65 140 110 Q110 90 70 100" strokeWidth="1.2" />
        <path d="M140 110 Q130 150 90 155 Q95 130 70 100" strokeWidth="1.2" />
        <path d="M90 155 Q55 150 45 120 Q55 130 70 100" strokeWidth="1.2" />
        {/* Inner swirl */}
        <path d="M70 85 Q65 75 72 68 Q78 75 75 85 Q82 78 85 85 Q78 90 70 85" strokeWidth="0.8" />
        {/* Stamen dots */}
        <circle cx="72" cy="80" r="1.5" fill="#976A5B" opacity="0.4" />
        <circle cx="78" cy="76" r="1" fill="#976A5B" opacity="0.3" />
      </g>

      {/* === Top-left leaves extending right === */}
      <g opacity="0.25" stroke="#6B8260" strokeLinecap="round">
        <path d="M140 90 Q180 70 220 75" strokeWidth="1" />
        <path d="M170 72 Q165 50 175 35" strokeWidth="0.9" />
        <path d="M170 72 Q155 55 150 38" strokeWidth="0.9" />
        {/* Leaf vein */}
        <path d="M170 72 Q163 53 153 40" strokeWidth="0.5" opacity="0.5" />
        <path d="M200 74 Q205 55 198 40" strokeWidth="0.8" />
        <path d="M200 74 Q210 58 215 42" strokeWidth="0.8" />
      </g>

      {/* === Top-right flowing branch with leaves === */}
      <g opacity="0.25" stroke="#6B8260" strokeLinecap="round">
        {/* Main stem curving down from top-right */}
        <path d="M1000 20 Q980 60 960 100 Q940 140 950 180" strokeWidth="1.1" />
        {/* Leaves */}
        <path d="M980 55 Q1010 40 1030 50" strokeWidth="0.9" />
        <path d="M980 55 Q1005 30 1020 25" strokeWidth="0.9" />
        <path d="M980 55 Q1010 35 1020 25" strokeWidth="0.5" opacity="0.5" />
        <path d="M960 100 Q935 80 940 60" strokeWidth="0.9" />
        <path d="M960 100 Q930 85 925 68" strokeWidth="0.9" />
        <path d="M955 140 Q980 125 995 130" strokeWidth="0.8" />
        <path d="M955 140 Q975 118 988 112" strokeWidth="0.8" />
      </g>

      {/* === Right-side large flower === */}
      <g opacity="0.25" stroke="#976A5B" strokeLinecap="round">
        <path d="M1100 250 Q1070 210 1095 175 Q1120 205 1110 235" strokeWidth="1.2" />
        <path d="M1095 175 Q1130 160 1155 185 Q1130 195 1110 235" strokeWidth="1.2" />
        <path d="M1155 185 Q1165 220 1145 250 Q1130 235 1110 235" strokeWidth="1.2" />
        <path d="M1145 250 Q1125 275 1095 265 Q1100 250 1110 235" strokeWidth="1.2" />
        <path d="M1095 265 Q1075 255 1080 230 Q1090 240 1110 235" strokeWidth="1.2" />
        {/* Center */}
        <circle cx="1112" cy="225" r="2" fill="#976A5B" opacity="0.3" />
      </g>

      {/* === Bottom-left botanical stem with buds === */}
      <g opacity="0.22" stroke="#6B8260" strokeLinecap="round">
        <path d="M30 500 Q60 460 100 440 Q140 420 180 430" strokeWidth="1" />
        {/* Leaves */}
        <path d="M70 470 Q55 450 60 430" strokeWidth="0.8" />
        <path d="M70 470 Q50 455 45 438" strokeWidth="0.8" />
        <path d="M130 430 Q140 410 135 395" strokeWidth="0.8" />
        <path d="M130 430 Q145 415 150 400" strokeWidth="0.8" />
        {/* Bud */}
        <path d="M180 430 Q178 418 180 410 Q182 418 180 430z" stroke="#976A5B" strokeWidth="0.8" />
        <path d="M180 430 Q175 422 172 415" stroke="#976A5B" strokeWidth="0.5" />
      </g>

      {/* === Scattered copper dots (pollen details) === */}
      <circle cx="250" cy="150" r="2" fill="#A0714E" opacity="0.15" />
      <circle cx="280" cy="130" r="1.5" fill="#A0714E" opacity="0.12" />
      <circle cx="900" cy="90" r="2" fill="#A0714E" opacity="0.12" />
      <circle cx="870" cy="110" r="1.2" fill="#A0714E" opacity="0.1" />
      <circle cx="400" cy="500" r="1.8" fill="#A0714E" opacity="0.1" />
      <circle cx="750" cy="50" r="1.5" fill="#A0714E" opacity="0.1" />

      {/* === Scattered grey dots === */}
      <circle cx="550" cy="80" r="2.5" fill="#9E9690" opacity="0.08" />
      <circle cx="700" cy="520" r="3" fill="#9E9690" opacity="0.07" />
      <circle cx="1050" cy="480" r="2" fill="#9E9690" opacity="0.08" />
    </svg>
  );
}
