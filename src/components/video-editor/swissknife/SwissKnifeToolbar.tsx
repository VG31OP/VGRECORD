import { useState } from "react";
import {
	Wrench,
	Crosshair,
	EyeSlash,
	Bookmarks,
	MicrophoneStage,
	Article,
	Check,
} from "@phosphor-icons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { SpotlightMode } from "./SpotlightOverlay";
import type { PrivacyMask } from "./PrivacyBlurOverlay";
import { ChapterMarkersModal, type ChapterMarker } from "./ChapterMarkersModal";
import { TeleprompterModal } from "./TeleprompterModal";
import type { VoiceEnhancerOptions } from "./StudioVoiceEnhancer";

interface SwissKnifeToolbarProps {
	spotlightMode: SpotlightMode;
	setSpotlightMode: (mode: SpotlightMode) => void;
	privacyMasks: PrivacyMask[];
	setPrivacyMasks: (masks: PrivacyMask[]) => void;
	chapters: ChapterMarker[];
	setChapters: (chapters: ChapterMarker[]) => void;
	currentTime: number;
	duration: number;
	onSeekToTime: (timeSeconds: number) => void;
	voiceEnhancerOptions: VoiceEnhancerOptions;
	setVoiceEnhancerOptions: (opts: VoiceEnhancerOptions) => void;
}

export function SwissKnifeToolbar({
	spotlightMode,
	setSpotlightMode,
	privacyMasks,
	setPrivacyMasks,
	chapters,
	setChapters,
	currentTime,
	duration,
	onSeekToTime,
	voiceEnhancerOptions,
	setVoiceEnhancerOptions,
}: SwissKnifeToolbarProps) {
	const [isChaptersOpen, setIsChaptersOpen] = useState(false);
	const [isPrompterOpen, setIsPrompterOpen] = useState(false);

	const handleAddPrivacyMask = () => {
		const newMask: PrivacyMask = {
			id: `mask_${Date.now()}`,
			x: 35,
			y: 40,
			width: 30,
			height: 20,
			blurType: "blur",
			label: `Mask #${privacyMasks.length + 1}`,
		};
		setPrivacyMasks([...privacyMasks, newMask]);
		toast.success("Added new privacy blur mask. Click & drag to position!");
	};

	const toggleVoiceEnhancer = () => {
		const nextState = !voiceEnhancerOptions.enabled;
		setVoiceEnhancerOptions({
			...voiceEnhancerOptions,
			enabled: nextState,
		});
		if (nextState) {
			toast.success("Studio Voice Enhancer AI activated (De-Hum + Clarity + Leveler)!");
		} else {
			toast.info("Voice Enhancer bypassed.");
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-7 gap-1.5 px-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/30"
						title="VGRECORD Swiss Army Knife Suite"
					>
						<Wrench className="h-3.5 w-3.5" weight="bold" />
						<span>Swiss Knife</span>
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" className="w-56 bg-neutral-950 border-neutral-800 text-white shadow-2xl">
					<DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
						Focus & Pointer
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => setSpotlightMode(spotlightMode === "spotlight" ? "off" : "spotlight")}
						className="flex items-center justify-between text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<span className="flex items-center gap-2">
							<Crosshair className="w-4 h-4 text-indigo-400" />
							<span>Focus Spotlight</span>
						</span>
						{spotlightMode === "spotlight" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setSpotlightMode(spotlightMode === "laser" ? "off" : "laser")}
						className="flex items-center justify-between text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<span className="flex items-center gap-2">
							<span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse ml-0.5" />
							<span>Laser Pointer</span>
						</span>
						{spotlightMode === "laser" && <Check className="w-3.5 h-3.5 text-red-400" />}
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setSpotlightMode(spotlightMode === "magnifier" ? "off" : "magnifier")}
						className="flex items-center justify-between text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<span className="flex items-center gap-2">
							<span className="text-xs">🔍</span>
							<span>Magnifying Lens</span>
						</span>
						{spotlightMode === "magnifier" && <Check className="w-3.5 h-3.5 text-indigo-400" />}
					</DropdownMenuItem>

					<DropdownMenuSeparator className="bg-neutral-800" />

					<DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
						Privacy & Audio
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={handleAddPrivacyMask}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<EyeSlash className="w-4 h-4 text-sky-400" />
						<span>+ Add Privacy Blur Mask</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={toggleVoiceEnhancer}
						className="flex items-center justify-between text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<span className="flex items-center gap-2">
							<MicrophoneStage className="w-4 h-4 text-emerald-400" />
							<span>Studio Voice DSP</span>
						</span>
						{voiceEnhancerOptions.enabled && <Check className="w-3.5 h-3.5 text-emerald-400" />}
					</DropdownMenuItem>

					<DropdownMenuSeparator className="bg-neutral-800" />

					<DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
						Creator Tools
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => setIsChaptersOpen(true)}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<Bookmarks className="w-4 h-4 text-amber-400" />
						<span>Chapters & Timestamps</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setIsPrompterOpen(true)}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-300 hover:text-white"
					>
						<Article className="w-4 h-4 text-purple-400" />
						<span>Presenter Teleprompter</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Chapter Markers Modal */}
			<ChapterMarkersModal
				isOpen={isChaptersOpen}
				onClose={() => setIsChaptersOpen(false)}
				currentTime={currentTime}
				duration={duration}
				chapters={chapters}
				onUpdateChapters={setChapters}
				onSeekToTime={onSeekToTime}
			/>

			{/* Presenter Teleprompter Modal */}
			<TeleprompterModal
				isOpen={isPrompterOpen}
				onClose={() => setIsPrompterOpen(false)}
			/>
		</>
	);
}
