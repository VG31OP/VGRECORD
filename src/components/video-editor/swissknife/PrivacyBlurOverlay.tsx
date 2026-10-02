import { useState, useRef, useEffect, useCallback } from "react";
import {
	X,
	Lock,
	Eye,
	EyeSlash,
	ArrowsOutSimple,
	Copy,
} from "@phosphor-icons/react";

export type BlurType = "blur" | "pixelate" | "blackout";

export interface PrivacyMask {
	id: string;
	x: number; // percentage 0-100
	y: number; // percentage 0-100
	width: number; // percentage 0-100
	height: number; // percentage 0-100
	blurType: BlurType;
	label?: string;
}

interface PrivacyBlurOverlayProps {
	enabled: boolean;
	masks: PrivacyMask[];
	onUpdateMasks: (masks: PrivacyMask[]) => void;
	isEditable?: boolean;
}

type DragAction =
	| { type: "move"; startX: number; startY: number; maskX: number; maskY: number; maskW: number; maskH: number; containerW: number; containerH: number }
	| { type: "resize"; handle: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w"; startX: number; startY: number; maskX: number; maskY: number; maskW: number; maskH: number; containerW: number; containerH: number };

export function PrivacyBlurOverlay({
	enabled,
	masks,
	onUpdateMasks,
	isEditable = true,
}: PrivacyBlurOverlayProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [activeActionId, setActiveActionId] = useState<string | null>(null);
	const dragActionRef = useRef<DragAction | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	const removeMask = useCallback((id: string) => {
		onUpdateMasks(masks.filter((m) => m.id !== id));
		if (selectedId === id) setSelectedId(null);
	}, [masks, onUpdateMasks, selectedId]);

	const duplicateMask = useCallback((id: string) => {
		const target = masks.find((m) => m.id === id);
		if (!target) return;
		const duplicated: PrivacyMask = {
			...target,
			id: `mask_${Date.now()}`,
			x: Math.min( target.x + 5, 100 - target.width),
			y: Math.min(target.y + 5, 100 - target.height),
			label: `${target.label || "Mask"} (Copy)`,
		};
		onUpdateMasks([...masks, duplicated]);
		setSelectedId(duplicated.id);
	}, [masks, onUpdateMasks]);

	const cycleBlurType = useCallback((id: string) => {
		onUpdateMasks(
			masks.map((m) => {
				if (m.id !== id) return m;
				const nextType: BlurType =
					m.blurType === "blur" ? "pixelate" : m.blurType === "pixelate" ? "blackout" : "blur";
				return { ...m, blurType: nextType };
			}),
		);
	}, [masks, onUpdateMasks]);

	// Global pointer listeners for rock-solid drag and resize without dropouts
	useEffect(() => {
		if (!activeActionId) return;

		const handlePointerMove = (e: PointerEvent) => {
			const action = dragActionRef.current;
			if (!action || !containerRef.current) return;

			const deltaXPct = ((e.clientX - action.startX) / action.containerW) * 100;
			const deltaYPct = ((e.clientY - action.startY) / action.containerH) * 100;

			if (action.type === "move") {
				const newX = Math.max(0, Math.min(100 - action.maskW, action.maskX + deltaXPct));
				const newY = Math.max(0, Math.min(100 - action.maskH, action.maskY + deltaYPct));

				onUpdateMasks(
					masks.map((m) =>
						m.id === activeActionId
							? { ...m, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 }
							: m,
					),
				);
			} else if (action.type === "resize") {
				let { maskX, maskY, maskW, maskH } = action;

				if (action.handle.includes("e")) {
					maskW = Math.max(4, Math.min(100 - maskX, maskW + deltaXPct));
				}
				if (action.handle.includes("s")) {
					maskH = Math.max(3, Math.min(100 - maskY, maskH + deltaYPct));
				}
				if (action.handle.includes("w")) {
					const potentialW = maskW - deltaXPct;
					if (potentialW >= 4 && maskX + deltaXPct >= 0) {
						maskX += deltaXPct;
						maskW = potentialW;
					}
				}
				if (action.handle.includes("n")) {
					const potentialH = maskH - deltaYPct;
					if (potentialH >= 3 && maskY + deltaYPct >= 0) {
						maskY += deltaYPct;
						maskH = potentialH;
					}
				}

				onUpdateMasks(
					masks.map((m) =>
						m.id === activeActionId
							? {
									...m,
									x: Math.round(maskX * 10) / 10,
									y: Math.round(maskY * 10) / 10,
									width: Math.round(maskW * 10) / 10,
									height: Math.round(maskH * 10) / 10,
								}
							: m,
					),
				);
			}
		};

		const handlePointerUp = () => {
			setActiveActionId(null);
			dragActionRef.current = null;
		};

		window.addEventListener("pointermove", handlePointerMove);
		window.addEventListener("pointerup", handlePointerUp);
		window.addEventListener("pointercancel", handlePointerUp);

		return () => {
			window.removeEventListener("pointermove", handlePointerMove);
			window.removeEventListener("pointerup", handlePointerUp);
			window.removeEventListener("pointercancel", handlePointerUp);
		};
	}, [activeActionId, masks, onUpdateMasks]);

	// Deselect on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setSelectedId(null);
			} else if ((e.key === "Delete" || e.key === "Backspace") && selectedId && isEditable) {
				const activeEl = document.activeElement;
				if (activeEl?.tagName !== "INPUT" && activeEl?.tagName !== "TEXTAREA") {
					removeMask(selectedId);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedId, isEditable, removeMask]);

	if (!enabled || masks.length === 0) return null;

	const startDrag = (e: React.PointerEvent, mask: PrivacyMask) => {
		if (!isEditable) return;
		e.stopPropagation();
		e.preventDefault();
		setSelectedId(mask.id);

		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect || rect.width === 0 || rect.height === 0) return;

		dragActionRef.current = {
			type: "move",
			startX: e.clientX,
			startY: e.clientY,
			maskX: mask.x,
			maskY: mask.y,
			maskW: mask.width,
			maskH: mask.height,
			containerW: rect.width,
			containerH: rect.height,
		};
		setActiveActionId(mask.id);
	};

	const startResize = (
		e: React.PointerEvent,
		mask: PrivacyMask,
		handle: "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w",
	) => {
		if (!isEditable) return;
		e.stopPropagation();
		e.preventDefault();
		setSelectedId(mask.id);

		const rect = containerRef.current?.getBoundingClientRect();
		if (!rect || rect.width === 0 || rect.height === 0) return;

		dragActionRef.current = {
			type: "resize",
			handle,
			startX: e.clientX,
			startY: e.clientY,
			maskX: mask.x,
			maskY: mask.y,
			maskW: mask.width,
			maskH: mask.height,
			containerW: rect.width,
			containerH: rect.height,
		};
		setActiveActionId(mask.id);
	};

	return (
		<div
			ref={containerRef}
			onClick={() => setSelectedId(null)}
			className="pointer-events-none absolute inset-0 z-[45] overflow-hidden select-none"
		>
			{masks.map((mask) => {
				const isSelected = selectedId === mask.id;

				let filterClasses = "backdrop-blur-xl bg-white/10 dark:bg-black/30";
				if (mask.blurType === "blackout") {
					filterClasses = "bg-neutral-950";
				} else if (mask.blurType === "pixelate") {
					filterClasses = "backdrop-blur-3xl bg-black/60 backdrop-contrast-200 backdrop-brightness-75";
				}

				return (
					<div
						key={mask.id}
						onPointerDown={(e) => startDrag(e, mask)}
						className={`group absolute rounded-lg transition-shadow pointer-events-auto cursor-move select-none ${filterClasses} ${
							isSelected
								? "ring-2 ring-indigo-500 shadow-[0_0_24px_rgba(99,102,241,0.6)]"
								: "border border-white/40 hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400/50"
						}`}
						style={{
							left: `${mask.x}%`,
							top: `${mask.y}%`,
							width: `${mask.width}%`,
							height: `${mask.height}%`,
						}}
					>
						{/* Header Badge */}
						<div className="absolute top-1.5 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white/95 backdrop-blur-md pointer-events-none border border-white/10 shadow-sm">
							<Lock className="w-3 h-3 text-indigo-400" />
							<span className="font-semibold uppercase tracking-wider">{mask.label || mask.blurType}</span>
							{isSelected && (
								<span className="text-[9px] text-neutral-400">
									{Math.round(mask.width)}%×{Math.round(mask.height)}%
								</span>
							)}
						</div>

						{/* Quick Action Floating Controls (When Selected) */}
						{isSelected && isEditable && (
							<>
								<div
									className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 rounded-lg bg-neutral-900/95 border border-neutral-700 shadow-2xl backdrop-blur-md z-50 pointer-events-auto"
									onPointerDown={(e) => e.stopPropagation()}
								>
									<button
										type="button"
										onClick={() => cycleBlurType(mask.id)}
										title="Switch Effect (Blur / Pixelate / Blackout)"
										className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors"
									>
										{mask.blurType === "blackout" ? (
											<EyeSlash className="w-3.5 h-3.5 text-red-400" />
										) : (
											<Eye className="w-3.5 h-3.5 text-sky-400" />
										)}
										<span className="capitalize">{mask.blurType}</span>
									</button>

									<div className="w-px h-3.5 bg-neutral-700" />

									<button
										type="button"
										onClick={() => duplicateMask(mask.id)}
										title="Duplicate Mask"
										className="p-1.5 rounded text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
									>
										<Copy className="w-3.5 h-3.5 text-indigo-400" />
									</button>

									<button
										type="button"
										onClick={() => removeMask(mask.id)}
										title="Delete Mask (or press Del)"
										className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-colors"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								</div>

								{/* Resize Handles - 4 Corners */}
								<div
									onPointerDown={(e) => startResize(e, mask, "nw")}
									className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-20 shadow-md"
								/>
								<div
									onPointerDown={(e) => startResize(e, mask, "ne")}
									className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-20 shadow-md"
								/>
								<div
									onPointerDown={(e) => startResize(e, mask, "sw")}
									className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-full cursor-nesw-resize hover:scale-125 transition-transform z-20 shadow-md"
								/>
								<div
									onPointerDown={(e) => startResize(e, mask, "se")}
									className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-indigo-600 border-2 border-white rounded-full cursor-nwse-resize hover:scale-125 transition-transform z-20 shadow-md flex items-center justify-center"
								>
									<ArrowsOutSimple className="w-2 h-2 text-white rotate-90 pointer-events-none" />
								</div>

								{/* Resize Handles - 4 Edges */}
								<div
									onPointerDown={(e) => startResize(e, mask, "n")}
									className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-indigo-500/80 rounded-full cursor-ns-resize hover:bg-indigo-400 z-10"
								/>
								<div
									onPointerDown={(e) => startResize(e, mask, "s")}
									className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-indigo-500/80 rounded-full cursor-ns-resize hover:bg-indigo-400 z-10"
								/>
								<div
									onPointerDown={(e) => startResize(e, mask, "w")}
									className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-6 bg-indigo-500/80 rounded-full cursor-ew-resize hover:bg-indigo-400 z-10"
								/>
								<div
									onPointerDown={(e) => startResize(e, mask, "e")}
									className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-6 bg-indigo-500/80 rounded-full cursor-ew-resize hover:bg-indigo-400 z-10"
								/>
							</>
						)}
					</div>
				);
			})}
		</div>
	);
}
