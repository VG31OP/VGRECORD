import { useState } from "react";
import {
	Wrench,
	EyeSlash,
	Bookmarks,
	MicrophoneStage,
	Article,
	Check,
	Trash,
	ShieldCheck,
	Lightning,
	Camera,
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
import type { PrivacyMask, BlurType } from "./PrivacyBlurOverlay";
import { ChapterMarkersModal, type ChapterMarker } from "./ChapterMarkersModal";
import { TeleprompterModal } from "./TeleprompterModal";
import type { VoiceEnhancerOptions } from "./StudioVoiceEnhancer";

interface SwissKnifeToolbarProps {
	privacyMasks: PrivacyMask[];
	setPrivacyMasks: (masks: PrivacyMask[]) => void;
	chapters: ChapterMarker[];
	setChapters: (chapters: ChapterMarker[]) => void;
	currentTime: number;
	duration: number;
	onSeekToTime: (timeSeconds: number) => void;
	voiceEnhancerOptions: VoiceEnhancerOptions;
	setVoiceEnhancerOptions: (opts: VoiceEnhancerOptions) => void;
	onAutoCutSilences?: () => void;
	onCaptureSnapshot?: () => void;
}

export function SwissKnifeToolbar({
	privacyMasks,
	setPrivacyMasks,
	chapters,
	setChapters,
	currentTime,
	duration,
	onSeekToTime,
	voiceEnhancerOptions,
	setVoiceEnhancerOptions,
	onAutoCutSilences,
	onCaptureSnapshot,
}: SwissKnifeToolbarProps) {
	const [isChaptersOpen, setIsChaptersOpen] = useState(false);
	const [isPrompterOpen, setIsPrompterOpen] = useState(false);

	const handleAddPrivacyMask = (type: BlurType = "blur", preset?: "box" | "password" | "banner" | "fullscreen") => {
		let newMask: PrivacyMask;

		if (preset === "password") {
			newMask = {
				id: `mask_${Date.now()}`,
				x: 30,
				y: 45,
				width: 40,
				height: 8,
				blurType: "pixelate",
				label: "Password / Key",
			};
		} else if (preset === "banner") {
			newMask = {
				id: `mask_${Date.now()}`,
				x: 10,
				y: 80,
				width: 80,
				height: 15,
				blurType: "blur",
				label: "Subtitles / Footer",
			};
		} else if (preset === "fullscreen") {
			newMask = {
				id: `mask_${Date.now()}`,
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				blurType: "blur",
				label: "Full Screen Blur",
			};
		} else {
			// default floating box
			newMask = {
				id: `mask_${Date.now()}`,
				x: 35,
				y: 35,
				width: 30,
				height: 22,
				blurType: type,
				label: `Redaction #${privacyMasks.length + 1}`,
			};
		}

		setPrivacyMasks([...privacyMasks, newMask]);
		toast.success("Added Privacy Redaction Mask. Click & drag anywhere to reposition!");
	};

	const handleClearAllMasks = () => {
		setPrivacyMasks([]);
		toast.info("Cleared all privacy masks.");
	};

	const toggleVoiceEnhancer = () => {
		const nextState = !voiceEnhancerOptions.enabled;
		setVoiceEnhancerOptions({
			...voiceEnhancerOptions,
			enabled: nextState,
		});
		if (nextState) {
			toast.success("Studio Voice Enhancer activated (De-Hum + 3.5kHz Clarity + Dynamic Leveler)!");
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
						className="h-7 gap-1.5 px-2.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 border border-indigo-500/30 shadow-sm"
						title="VGRECORD Swiss Army Knife Suite"
					>
						<Wrench className="h-3.5 w-3.5" weight="bold" />
						<span>Swiss Knife</span>
						{privacyMasks.length > 0 && (
							<span className="ml-0.5 rounded-full bg-indigo-500/30 px-1.5 py-0.2 text-[10px] font-mono text-indigo-300">
								{privacyMasks.length}
							</span>
						)}
					</Button>
				</DropdownMenuTrigger>

				<DropdownMenuContent align="start" className="w-64 bg-neutral-950/95 border-neutral-800 text-white shadow-2xl backdrop-blur-md">
					<DropdownMenuLabel className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-neutral-400">
						<span>Privacy & Redaction</span>
						{privacyMasks.length > 0 && (
							<span className="text-sky-400 font-normal lowercase">
								{privacyMasks.length} active
							</span>
						)}
					</DropdownMenuLabel>

					<DropdownMenuItem
						onClick={() => handleAddPrivacyMask("blur", "box")}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-200 hover:text-white"
					>
						<ShieldCheck className="w-4 h-4 text-sky-400" />
						<span>+ Add Redaction Box (Floating)</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => handleAddPrivacyMask("pixelate", "password")}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-200 hover:text-white"
					>
						<EyeSlash className="w-4 h-4 text-amber-400" />
						<span>+ Password / Token Strip</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => handleAddPrivacyMask("blur", "banner")}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-200 hover:text-white"
					>
						<EyeSlash className="w-4 h-4 text-purple-400" />
						<span>+ Bottom Banner / Subtitle Censor</span>
					</DropdownMenuItem>

					{privacyMasks.length > 0 && (
						<DropdownMenuItem
							onClick={handleClearAllMasks}
							className="flex items-center gap-2 text-xs cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10"
						>
							<Trash className="w-4 h-4" />
							<span>Clear All Redaction Masks</span>
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator className="bg-neutral-800" />

					<DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
						Audio & Pacing
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={toggleVoiceEnhancer}
						className="flex items-center justify-between text-xs cursor-pointer text-neutral-200 hover:text-white"
					>
						<span className="flex items-center gap-2">
							<MicrophoneStage className="w-4 h-4 text-emerald-400" />
							<span>Studio Voice DSP (AI De-Hum)</span>
						</span>
						{voiceEnhancerOptions.enabled && <Check className="w-3.5 h-3.5 text-emerald-400" />}
					</DropdownMenuItem>

					{onAutoCutSilences && (
						<DropdownMenuItem
							onClick={onAutoCutSilences}
							className="flex items-center gap-2 text-xs cursor-pointer text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
						>
							<Lightning className="w-4 h-4 text-amber-400" weight="fill" />
							<span>AI Silence Auto-Cut (Dead-Air)</span>
						</DropdownMenuItem>
					)}

					<DropdownMenuSeparator className="bg-neutral-800" />

					<DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
						Production & Publishing
					</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => setIsChaptersOpen(true)}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-200 hover:text-white"
					>
						<Bookmarks className="w-4 h-4 text-amber-400" />
						<span>YouTube & Loom Chapters</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={() => setIsPrompterOpen(true)}
						className="flex items-center gap-2 text-xs cursor-pointer text-neutral-200 hover:text-white"
					>
						<Article className="w-4 h-4 text-purple-400" />
						<span>Presenter Teleprompter</span>
					</DropdownMenuItem>

					{onCaptureSnapshot && (
						<DropdownMenuItem
							onClick={onCaptureSnapshot}
							className="flex items-center gap-2 text-xs cursor-pointer text-sky-300 hover:text-sky-200 hover:bg-sky-500/10"
						>
							<Camera className="w-4 h-4 text-sky-400" />
							<span>Capture Cover Thumbnail (PNG)</span>
						</DropdownMenuItem>
					)}
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
