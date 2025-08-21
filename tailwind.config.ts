
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '1rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1440px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			fontSize: {
				'xs': ['11px', '16px'],
				'sm': ['12px', '16px'],
				'base': ['14px', '20px'],
				'lg': ['16px', '24px'],
				'xl': ['18px', '28px'],
				'2xl': ['20px', '28px'],
				'3xl': ['24px', '32px'],
			},
			colors: {
				background: 'hsl(var(--background))',
				'background-secondary': 'hsl(var(--background-secondary))',
				foreground: 'hsl(var(--foreground))',
				'secondary-foreground': 'hsl(var(--secondary-foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
				},
				'sidebar-border': 'hsl(var(--sidebar-border))',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem',
			},
			maxWidth: {
				'8xl': '1440px',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
