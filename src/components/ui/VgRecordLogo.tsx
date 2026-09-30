import type { SVGProps } from "react";

interface VgRecordLogoProps extends SVGProps<SVGSVGElement> {
	size?: number;
	className?: string;
}

export function VgRecordLogo({ size = 28, className = "", ...props }: VgRecordLogoProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 64 64"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={`shrink-0 select-none ${className}`}
			{...props}
		>
			<defs>
				<linearGradient id="vg-bg" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#6366F1" />
					<stop offset="50%" stopColor="#8B5CF6" />
					<stop offset="100%" stopColor="#EC4899" />
				</linearGradient>
				<linearGradient id="vg-glow" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
					<stop offset="100%" stopColor="#E0E7FF" stopOpacity="0.8" />
				</linearGradient>
				<linearGradient id="vg-dot" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" stopColor="#FF4D4D" />
					<stop offset="100%" stopColor="#F43F5E" />
				</linearGradient>
				<filter id="vg-shadow" x="-20%" y="-20%" width="140%" height="140%">
					<feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#4F46E5" floodOpacity="0.3" />
				</filter>
			</defs>

			{/* Squircle Background */}
			<rect
				x="2"
				y="2"
				width="60"
				height="60"
				rx="15"
				fill="url(#vg-bg)"
				filter="url(#vg-shadow)"
			/>

			{/* Outer Aperture Ring */}
			<circle
				cx="32"
				cy="32"
				r="22"
				stroke="rgba(255, 255, 255, 0.25)"
				strokeWidth="2.5"
				strokeDasharray="4 3"
			/>

			{/* Stylized Dynamic "V" Path */}
			<path
				d="M19 22L32 44L45 22"
				stroke="url(#vg-glow)"
				strokeWidth="5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>

			{/* High-Tech Glowing Center Record Lens Dot */}
			<circle cx="32" cy="28" r="4.5" fill="url(#vg-dot)" />
			<circle cx="32" cy="28" r="6.5" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.7" />
		</svg>
	);
}
