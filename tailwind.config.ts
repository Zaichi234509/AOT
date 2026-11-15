import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2D5A27',
          light: '#4A7C3F',
          dark: '#1A3A18',
        },
        secondary: {
          DEFAULT: '#CC2200',
          light: '#FF4422',
          dark: '#8B1500',
        },
        ink: {
          950: '#0A0A0A',
          900: '#0F0F0F',
          850: '#141414',
          800: '#1A1A1A',
        },
        parchment: '#F5F0E8',
        ash: '#A09888',
        smoke: '#666058',
        gold: '#D4A574',
        skyblue: '#87CEEB',
        navy: '#1A2744',
        murky: '#3A4A2A',
        dust: '#D4874A',
        amber: '#FF9944',
        fire: '#FF6600',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Cinzel', 'Georgia', 'serif'],
        jp: ['var(--font-japanese)', 'Noto Serif JP', 'Yu Mincho', 'serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1', fontWeight: '900' }],
      },
      maxWidth: {
        content: '1280px',
      },
      // Tailwind's default opacity scale is coarse (0/5/10/20/25/…). The design
      // uses fine-grained scrims (bg-black/85, border-white/15, bg-ink-950/97),
      // so expose every integer percentage.
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [String(i), String(i / 100)])
      ),
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        glowGreen: '0 0 20px rgba(45,90,39,0.45)',
        glowRed: '0 0 20px rgba(204,34,0,0.45)',
        lg: '0 8px 32px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'radial-fade': 'radial-gradient(ellipse at center, rgba(45,90,39,0.18), transparent 70%)',
        'grid-faint':
          'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%,100%': { opacity: '0.35' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'bar-dance': {
          '0%,100%': { transform: 'scaleY(0.25)' },
          '50%': { transform: 'scaleY(1)' },
        },
        flicker: {
          '0%,100%': { opacity: '1' },
          '45%': { opacity: '0.82' },
          '47%': { opacity: '0.95' },
          '60%': { opacity: '0.7' },
        },
        'scroll-bounce': {
          '0%,100%': { transform: 'translateY(0)', opacity: '0.6' },
          '50%': { transform: 'translateY(8px)', opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 700ms cubic-bezier(0.16,1,0.3,1) both',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
        'bar-dance': 'bar-dance 900ms ease-in-out infinite',
        flicker: 'flicker 4s linear infinite',
        'scroll-bounce': 'scroll-bounce 1.8s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
