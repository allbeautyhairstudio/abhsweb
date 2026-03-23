/**
 * Botanical line-art SVG accents inspired by Karli's brand.
 * Hand-drawn style with stroke-based paths — recognizable flowers,
 * leaves, and stems. Subtle but adds visual warmth and personality.
 */

interface AccentProps {
  className?: string;
  withVines?: boolean;
}

/** Detailed rose bloom -- layered petals, stamen, sepals, and leaves */
export function FloralBloom({ className = '' }: AccentProps) {
  return (
    <svg
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Outer petal layer -- 5 large petals with organic curves */}
      <path d="M30 8 Q24 14 23 20 Q22 14 26 8 Q28 6 30 8z" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <path d="M30 8 Q36 14 37 20 Q38 14 34 8 Q32 6 30 8z" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <path d="M44 16 Q40 22 36 24 Q42 20 46 18 Q46 16 44 16z" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      <path d="M48 28 Q42 26 38 28 Q42 24 48 24 Q50 26 48 28z" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      <path d="M16 16 Q20 22 24 24 Q18 20 14 18 Q14 16 16 16z" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      <path d="M12 28 Q18 26 22 28 Q18 24 12 24 Q10 26 12 28z" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      <path d="M30 52 Q24 46 23 40 Q22 46 26 52 Q28 54 30 52z" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <path d="M30 52 Q36 46 37 40 Q38 46 34 52 Q32 54 30 52z" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <path d="M46 42 Q40 38 36 36 Q42 38 46 40 Q48 42 46 42z" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />
      <path d="M14 42 Q20 38 24 36 Q18 38 14 40 Q12 42 14 42z" stroke="currentColor" strokeWidth="0.6" opacity="0.28" />

      {/* Mid petal layer -- slightly smaller, overlapping */}
      <path d="M30 12 Q26 18 25 24 Q24 18 28 13 Q30 11 30 12z" stroke="currentColor" strokeWidth="0.65" opacity="0.38" />
      <path d="M30 12 Q34 18 35 24 Q36 18 32 13 Q30 11 30 12z" stroke="currentColor" strokeWidth="0.65" opacity="0.38" />
      <path d="M42 22 Q38 26 34 28 Q38 24 42 22z" stroke="currentColor" strokeWidth="0.65" opacity="0.35" />
      <path d="M18 22 Q22 26 26 28 Q22 24 18 22z" stroke="currentColor" strokeWidth="0.65" opacity="0.35" />
      <path d="M30 48 Q26 42 25 36 Q24 42 28 47 Q30 49 30 48z" stroke="currentColor" strokeWidth="0.65" opacity="0.38" />
      <path d="M30 48 Q34 42 35 36 Q36 42 32 47 Q30 49 30 48z" stroke="currentColor" strokeWidth="0.65" opacity="0.38" />
      <path d="M42 38 Q38 34 34 32 Q38 36 42 38z" stroke="currentColor" strokeWidth="0.65" opacity="0.35" />
      <path d="M18 38 Q22 34 26 32 Q22 36 18 38z" stroke="currentColor" strokeWidth="0.65" opacity="0.35" />

      {/* Inner petal spiral -- the tight center of the rose */}
      <path
        d="M30 25 Q28 27 29 30 Q31 28 33 29 Q31 31 30 33 Q28 31 27 30 Q29 28 30 25z"
        stroke="currentColor" strokeWidth="0.7" opacity="0.5"
      />
      <path
        d="M30 27 Q29 29 30 30 Q31 29 30 27z"
        stroke="currentColor" strokeWidth="0.6" opacity="0.55"
      />

      {/* Center stamen dots */}
      <circle cx="29.5" cy="29" r="0.8" fill="currentColor" opacity="0.4" />
      <circle cx="31" cy="30.5" r="0.6" fill="currentColor" opacity="0.35" />
      <circle cx="29" cy="31" r="0.5" fill="currentColor" opacity="0.3" />

      {/* Sepals -- the small leaf-like structures behind the petals */}
      <path d="M24 10 Q22 6 20 4 Q24 6 26 10" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <path d="M36 10 Q38 6 40 4 Q36 6 34 10" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <path d="M24 50 Q22 54 20 56 Q24 54 26 50" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <path d="M36 50 Q38 54 40 56 Q36 54 34 50" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />

      {/* Leaves with veins -- reaching diagonally from the bloom */}
      <path d="M10 10 Q14 14 18 18" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M8 14 Q12 12 16 14 Q12 16 8 14z" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <path d="M12 10 Q14 12 12 14" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

      <path d="M50 50 Q46 46 42 42" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M52 46 Q48 48 44 46 Q48 44 52 46z" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
      <path d="M48 50 Q46 48 48 46" stroke="currentColor" strokeWidth="0.3" opacity="0.2" />

      {/* Tiny pollen dots around the bloom */}
      <circle cx="22" cy="16" r="0.5" fill="currentColor" opacity="0.2" />
      <circle cx="38" cy="16" r="0.5" fill="currentColor" opacity="0.2" />
      <circle cx="22" cy="44" r="0.5" fill="currentColor" opacity="0.18" />
      <circle cx="38" cy="44" r="0.5" fill="currentColor" opacity="0.18" />
      <circle cx="14" cy="30" r="0.4" fill="currentColor" opacity="0.15" />
      <circle cx="46" cy="30" r="0.4" fill="currentColor" opacity="0.15" />
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

/** Corner botanical arrangement — roses, leaves, and buds flowing from corner */
export function FloralCorner({ className = '', withVines = false }: AccentProps) {
  return (
    <svg
      viewBox={withVines ? "0 0 170 170" : "0 0 120 120"}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Main branch from bottom-left */}
      <path
        d="M5 115 Q15 90 25 75 Q35 60 50 48 Q60 40 70 30"
        stroke="currentColor" strokeWidth="0.8" opacity="0.4"
        strokeLinecap="round"
      />
      {/* Secondary branch */}
      <path
        d="M5 115 Q25 100 40 90 Q55 80 75 72 Q90 65 105 60"
        stroke="currentColor" strokeWidth="0.6" opacity="0.35"
        strokeLinecap="round"
      />
      {/* Tertiary wisp */}
      <path
        d="M5 115 Q10 105 20 100 Q30 95 45 95"
        stroke="currentColor" strokeWidth="0.5" opacity="0.3"
        strokeLinecap="round"
      />

      {/* Main rose at top of primary branch */}
      <circle cx="70" cy="30" r="3" stroke="currentColor" strokeWidth="0.6" opacity="0.45" />
      <path d="M70 23 Q67 26 68 30 Q70 26 70 23z" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M70 23 Q73 26 72 30 Q70 26 70 23z" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M63 28 Q66 26 70 28 Q66 30 63 28z" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M77 28 Q74 26 70 28 Q74 30 77 28z" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
      <path d="M70 37 Q67 34 68 30 Q70 34 70 37z" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <path d="M70 37 Q73 34 72 30 Q70 34 70 37z" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      {/* Rose leaves */}
      <path d="M62 35 Q58 30 60 26" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <path d="M62 35 Q56 32 55 28" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M62 35 Q58 30 55 28" stroke="currentColor" strokeWidth="0.3" opacity="0.22" />

      {/* Small bud on secondary branch */}
      <path d="M90 63 Q88 58 90 55 Q92 58 90 63z" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <path d="M90 63 Q87 61 86 58" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />

      {/* Bud at end of secondary branch */}
      <path d="M105 60 Q103 55 105 52 Q107 55 105 60z" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />

      {/* Leaves along main branch */}
      <path d="M30 70 Q24 64 26 58" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <path d="M30 70 Q22 66 20 60" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <path d="M30 70 Q24 64 20 60" stroke="currentColor" strokeWidth="0.3" opacity="0.22" />

      <path d="M45 55 Q40 49 42 44" stroke="currentColor" strokeWidth="0.5" opacity="0.35" />
      <path d="M45 55 Q38 51 37 46" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />

      {/* Small leaves along secondary branch */}
      <path d="M55 83 Q50 78 52 74" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
      <path d="M55 83 Q48 80 47 76" stroke="currentColor" strokeWidth="0.4" opacity="0.28" />

      {/* Leaves on tertiary wisp */}
      <path d="M25 98 Q22 94 24 91" stroke="currentColor" strokeWidth="0.4" opacity="0.3" />
      <path d="M38 95 Q36 91 38 88" stroke="currentColor" strokeWidth="0.4" opacity="0.28" />

      {/* Tiny scattered dots (pollen/details) */}
      <circle cx="80" cy="40" r="0.8" fill="currentColor" opacity="0.25" />
      <circle cx="95" cy="55" r="0.6" fill="currentColor" opacity="0.22" />
      <circle cx="48" cy="45" r="0.7" fill="currentColor" opacity="0.22" />

      {withVines && (
        <>
          {/* Extended vine trailing from main branch */}
          <path d="M95 25 Q110 15 130 20 Q145 25 160 18" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
          <path d="M130 20 Q128 14 133 10" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
          <path d="M145 25 Q148 19 143 15" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
          {/* Extended vine trailing from secondary branch */}
          <path d="M25 95 Q15 110 20 130 Q25 145 18 160" stroke="currentColor" strokeWidth="0.5" opacity="0.25" />
          <path d="M20 130 Q14 128 10 133" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
          <path d="M25 145 Q19 143 15 148" stroke="currentColor" strokeWidth="0.4" opacity="0.2" />
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
