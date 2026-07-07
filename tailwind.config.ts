import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			poppins: ['var(--font-poppins)', 'sans-serif'],
  			playfair: ['var(--font-playfair)', 'serif'],
  			quera: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
  		},
  		fontSize: {
  			"rem-65":  ["0.65rem",  { lineHeight: "1.4" }],
  			"rem-70":  ["0.70rem",  { lineHeight: "1.4" }],
  			"rem-75":  ["0.75rem",  { lineHeight: "1.4" }],
  			"rem-80":  ["0.80rem",  { lineHeight: "1.5" }],
  			"rem-85":  ["0.85rem",  { lineHeight: "1.5" }],
  			"rem-90":  ["0.90rem",  { lineHeight: "1.5" }],
  			"rem-95":  ["0.95rem",  { lineHeight: "1.5" }],
  			"rem-100": ["1.00rem",  { lineHeight: "1.5" }],
  			"rem-110": ["1.10rem",  { lineHeight: "1.5" }],
  			"rem-120": ["1.20rem",  { lineHeight: "1.4" }],
  			"rem-130": ["1.30rem",  { lineHeight: "1.35" }],
  			"rem-140": ["1.40rem",  { lineHeight: "1.3" }],
  			"rem-150": ["1.50rem",  { lineHeight: "1.3" }],
  			"rem-160": ["1.60rem",  { lineHeight: "1.25" }],
  			"rem-200": ["2.00rem",  { lineHeight: "1.2" }],
  		},
  		keyframes: {
  			"word-blast": {
  				"0%":   { opacity: "0", transform: "scale(1.5)", filter: "blur(8px)" },
  				"55%":  { opacity: "1", transform: "scale(0.94)", filter: "blur(0px)" },
  				"100%": { opacity: "1", transform: "scale(1)" },
  			},
  		},
  		animation: {
  			"word-blast": "word-blast 550ms cubic-bezier(0.16, 1, 0.3, 1) both",
  		},
  		colors: {
  			midnight: {
  				DEFAULT: '#0D0D0D',
  				50: '#1A1A1A',
  				100: '#171717',
  				200: '#141414',
  				300: '#111111',
  				400: '#0F0F0F',
  				500: '#0D0D0D',
  			},
  			gold: {
  				DEFAULT: '#D4AF37',
  				50: '#FDF9E8',
  				100: '#FBF3D1',
  				200: '#F7E7A3',
  				300: '#F3DB75',
  				400: '#EFCF47',
  				500: '#EBC319',
  				600: '#D4AF37',
  				700: '#B8962E',
  				800: '#9C7E25',
  				900: '#80651C',
  			},
  			navy: {
  				DEFAULT: '#0A0A23',
  				50: '#F4F4FB',
  				100: '#E9E9F7',
  				200: '#D3D3EF',
  				300: '#BDBDE7',
  				400: '#A7A7DF',
  				500: '#9191D7',
  				600: '#7B7BCF',
  				700: '#6565C7',
  				800: '#4F4FBF',
  				900: '#0A0A23',
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
