import { useState, useEffect } from "react";

export type SpotlightMode = "off" | "spotlight" | "laser" | "magnifier";

interface SpotlightOverlayProps {
	mode: SpotlightMode;
	cursorX?: number; // 0 to 1 relative or px
	cursorY?: number;
	radius?: number; // radius in px
	dimOpacity?: number; // 0.1 to 0.95
}

export function SpotlightOverlay({
	mode,
	cursorX,
	cursorY,
	radius = 120,
	dimOpacity = 0.72,
}: SpotlightOverlayProps) {
	const [mousePos, setMousePos] = useState({ x: 50, y: 50, isPercent: true });

	useEffect(() => {
		if (mode === "off") return;

		const handleMouseMove = (e: MouseEvent) => {
			const container = document.querySelector(".editor-preview-frame");
			if (!container) return;
			const rect = container.getBoundingClientRect();
			if (
				e.clientX >= rect.left &&
				e.clientX <= rect.right &&
				e.clientY >= rect.top &&
				e.clientY <= rect.bottom
			) {
				const x = ((e.clientX - rect.left) / rect.width) * 100;
				const y = ((e.clientY - rect.top) / rect.height) * 100;
				setMousePos({ x, y, isPercent: true });
			}
		};

		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [mode]);

	if (mode === "off") return null;

	const posX = cursorX !== undefined ? `${cursorX * 100}%` : `${mousePos.x}%`;
	const posY = cursorY !== undefined ? `${cursorY * 100}%` : `${mousePos.y}%`;

	if (mode === "laser") {
		return (
			<div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
				<div
					className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
					style={{
						left: posX,
						top: posY,
					}}
				>
					{/* Laser Core */}
					<div className="relative flex items-center justify-center">
						<div className="h-4 w-4 rounded-full bg-red-500 shadow-[0_0_16px_6px_rgba(239,68,68,0.9)] animate-ping absolute" />
						<div className="h-3.5 w-3.5 rounded-full bg-white border-2 border-red-500 shadow-[0_0_12px_4px_rgba(239,68,68,1)] z-10" />
						<div className="h-8 w-8 rounded-full border border-red-400/40 animate-pulse absolute" />
					</div>
				</div>
			</div>
		);
	}

	if (mode === "magnifier") {
		return (
			<div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
				<div
					className="absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
					style={{
						left: posX,
						top: posY,
						width: `${radius * 2}px`,
						height: `${radius * 2}px`,
					}}
				>
					<div className="h-full w-full rounded-full border-4 border-indigo-400/80 shadow-[0_10px_35px_rgba(0,0,0,0.5),0_0_20px_rgba(99,102,241,0.4)] backdrop-brightness-125 backdrop-contrast-110 flex items-center justify-center">
						<div className="h-2 w-2 rounded-full bg-indigo-400/60" />
						<div className="absolute inset-0 rounded-full border border-white/40" />
					</div>
				</div>
			</div>
		);
	}

	// Spotlight Mode (Dark mask cutout)
	return (
		<div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
			<svg className="h-full w-full" preserveAspectRatio="none">
				<defs>
					<mask id="spotlight-mask">
						{/* White reveals everything (the dark overlay) */}
						<rect x="0" y="0" width="100%" height="100%" fill="white" />
						{/* Black cuts out the spotlight hole */}
						<circle cx={posX} cy={posY} r={radius} fill="black" />
					</mask>
					<radialGradient id="spotlight-glow" cx="50%" cy="50%" r="50%">
						<stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
						<stop offset="85%" stopColor="rgba(255,255,255,0.02)" />
						<stop offset="100%" stopColor="rgba(0,0,0,0)" />
					</radialGradient>
				</defs>
				{/* Dimmed Background */}
				<rect
					x="0"
					y="0"
					width="100%"
					height="100%"
					fill="rgba(0, 0, 0, 0.85)"
					style={{ opacity: dimOpacity }}
					mask="url(#spotlight-mask)"
				/>
				{/* Illuminated Highlight Ring */}
				<circle
					cx={posX}
					cy={posY}
					r={radius}
					fill="url(#spotlight-glow)"
					stroke="rgba(255, 255, 255, 0.4)"
					strokeWidth="2"
				/>
			</svg>
		</div>
	);
}
