import { useEffect, useState } from "react";

export type KeystrokeBadgePosition = "bottom-center" | "bottom-right" | "top-right" | "follow-cursor";
export type KeystrokeBadgeTheme = "glass-dark" | "cyber-neon" | "minimal-light";

export interface KeystrokeEvent {
	id: string;
	keys: string[];
	timestamp: number;
}

export interface KeystrokeVisualizerProps {
	enabled?: boolean;
	position?: KeystrokeBadgePosition;
	theme?: KeystrokeBadgeTheme;
	cursorPosition?: { x: number; y: number } | null;
	activeKeys?: string[];
}

export function KeystrokeVisualizer({
	enabled = true,
	position = "bottom-center",
	theme = "glass-dark",
	cursorPosition,
	activeKeys: externalActiveKeys,
}: KeystrokeVisualizerProps) {
	const [visibleBadge, setVisibleBadge] = useState<{ keys: string[]; id: string } | null>(null);

	// Listen for live keyboard events in the window if not driven externally
	useEffect(() => {
		if (!enabled || externalActiveKeys !== undefined) return;

		let timeoutId: NodeJS.Timeout | null = null;

		const handleKeyDown = (e: KeyboardEvent) => {
			const keys: string[] = [];
			if (e.ctrlKey) keys.push("Ctrl");
			if (e.metaKey) keys.push("⌘ Cmd");
			if (e.altKey) keys.push("Alt");
			if (e.shiftKey) keys.push("Shift");

			let keyName = e.key;
			if (keyName === " ") keyName = "Space";
			else if (keyName === "Control" || keyName === "Meta" || keyName === "Alt" || keyName === "Shift") {
				keyName = "";
			} else if (keyName.length === 1) {
				keyName = keyName.toUpperCase();
			}

			if (keyName && !keys.includes(keyName)) {
				keys.push(keyName);
			}

			if (keys.length > 0) {
				const id = `${Date.now()}-${keys.join("+")}`;
				setVisibleBadge({ keys, id });
				if (timeoutId) clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					setVisibleBadge(null);
				}, 1800);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [enabled, externalActiveKeys]);

	useEffect(() => {
		if (externalActiveKeys && externalActiveKeys.length > 0) {
			setVisibleBadge({ keys: externalActiveKeys, id: `${Date.now()}` });
		}
	}, [externalActiveKeys]);

	if (!enabled || !visibleBadge || visibleBadge.keys.length === 0) return null;

	const themeStyles = {
		"glass-dark": "bg-black/75 text-white border border-white/20 shadow-2xl backdrop-blur-md",
		"cyber-neon": "bg-slate-950/90 text-cyan-300 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)] backdrop-blur-md",
		"minimal-light": "bg-white/95 text-slate-900 border border-slate-200 shadow-xl backdrop-blur-md",
	}[theme];

	const keyCapStyles = {
		"glass-dark": "bg-white/15 text-white border-b-2 border-white/30 shadow-sm",
		"cyber-neon": "bg-cyan-950/60 text-cyan-200 border border-cyan-400/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]",
		"minimal-light": "bg-slate-100 text-slate-800 border-b-2 border-slate-300 shadow-sm",
	}[theme];

	const positionClasses = {
		"bottom-center": "bottom-12 left-1/2 -translate-x-1/2",
		"bottom-right": "bottom-12 right-12",
		"top-right": "top-16 right-12",
		"follow-cursor": "",
	}[position];

	const inlineStyles =
		position === "follow-cursor" && cursorPosition
			? {
					left: `${cursorPosition.x + 24}px`,
					top: `${cursorPosition.y + 24}px`,
				}
			: undefined;

	return (
		<div
			className={`pointer-events-none fixed z-[9999] flex items-center gap-1.5 rounded-2xl px-3.5 py-2 transition-all duration-200 animate-in fade-in zoom-in-95 ${themeStyles} ${positionClasses}`}
			style={inlineStyles}
			role="status"
			aria-live="polite"
		>
			<span className="text-[11px] font-semibold tracking-wider opacity-60 mr-1 uppercase">Key</span>
			{visibleBadge.keys.map((k, idx) => (
				<span key={idx} className="flex items-center gap-1.5">
					{idx > 0 && <span className="opacity-40 text-xs font-bold">+</span>}
					<kbd className={`rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide font-mono ${keyCapStyles}`}>
						{k}
					</kbd>
				</span>
			))}
		</div>
	);
}
