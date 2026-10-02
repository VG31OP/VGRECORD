import { useState } from "react";
import { X, Lock, Eye, EyeSlash } from "@phosphor-icons/react";

export interface PrivacyMask {
	id: string;
	x: number; // percentage 0-100
	y: number; // percentage 0-100
	width: number; // percentage 0-100
	height: number; // percentage 0-100
	blurType: "blur" | "pixelate" | "blackout";
	label?: string;
}

interface PrivacyBlurOverlayProps {
	enabled: boolean;
	masks: PrivacyMask[];
	onUpdateMasks: (masks: PrivacyMask[]) => void;
	isEditable?: boolean;
}

export function PrivacyBlurOverlay({
	enabled,
	masks,
	onUpdateMasks,
	isEditable = true,
}: PrivacyBlurOverlayProps) {
	const [selectedId, setSelectedId] = useState<string | null>(null);

	if (!enabled || masks.length === 0) return null;

	const removeMask = (id: string) => {
		onUpdateMasks(masks.filter((m) => m.id !== id));
		if (selectedId === id) setSelectedId(null);
	};

	const toggleBlurType = (id: string) => {
		onUpdateMasks(
			masks.map((m) => {
				if (m.id !== id) return m;
				const nextType =
					m.blurType === "blur" ? "pixelate" : m.blurType === "pixelate" ? "blackout" : "blur";
				return { ...m, blurType: nextType };
			}),
		);
	};

	return (
		<div className="pointer-events-none absolute inset-0 z-25 overflow-hidden">
			{masks.map((mask) => {
				const isSelected = selectedId === mask.id;
				let filterStyle = "backdrop-blur-md bg-white/5";
				if (mask.blurType === "blackout") {
					filterStyle = "bg-neutral-950";
				} else if (mask.blurType === "pixelate") {
					filterStyle = "backdrop-blur-xl bg-black/30 backdrop-contrast-200";
				}

				return (
					<div
						key={mask.id}
						onClick={(e) => {
							if (!isEditable) return;
							e.stopPropagation();
							setSelectedId(mask.id);
						}}
						className={`absolute rounded-md overflow-hidden transition-all pointer-events-auto cursor-move select-none ${filterStyle} ${
							isSelected
								? "ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
								: "border border-white/20 hover:border-indigo-400/60"
						}`}
						style={{
							left: `${mask.x}%`,
							top: `${mask.y}%`,
							width: `${mask.width}%`,
							height: `${mask.height}%`,
						}}
					>
						{/* Mask Content Badge */}
						<div className="absolute top-1 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 text-[9px] font-mono text-white/90 backdrop-blur-sm">
							<Lock className="w-2.5 h-2.5 text-indigo-400" />
							<span>{mask.label || mask.blurType.toUpperCase()}</span>
						</div>

						{/* Edit controls if selected */}
						{isSelected && isEditable && (
							<div className="absolute top-1 right-1 flex items-center gap-1 z-10">
								<button
									onClick={(e) => {
										e.stopPropagation();
										toggleBlurType(mask.id);
									}}
									title="Cycle mask style (Blur / Pixelate / Blackout)"
									className="p-1 rounded bg-black/70 hover:bg-neutral-800 text-white/80 hover:text-white"
								>
									{mask.blurType === "blackout" ? (
										<EyeSlash className="w-2.5 h-2.5" />
									) : (
										<Eye className="w-2.5 h-2.5" />
									)}
								</button>
								<button
									onClick={(e) => {
										e.stopPropagation();
										removeMask(mask.id);
									}}
									title="Remove privacy mask"
									className="p-1 rounded bg-red-600/80 hover:bg-red-500 text-white"
								>
									<X className="w-2.5 h-2.5" />
								</button>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
