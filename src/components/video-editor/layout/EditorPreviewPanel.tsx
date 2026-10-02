import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
	Camera,
	CaretDown,
	Check,
	Crop,
	MagicWand,
	MagnifyingGlassPlus,
	Pause,
	Play,
	Plus,
	Scissors,
	SkipBack,
	SkipForward,
	SpeakerHigh,
	SpeakerLow,
	SpeakerX,
} from "@/components/ui/icons";
import { Lightning } from "@phosphor-icons/react";
import { useState, useEffect, type Dispatch, type RefObject, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { useI18n } from "@/contexts/I18nContext";
import { ASPECT_RATIOS, type AspectRatio, getAspectRatioLabel } from "@/utils/aspectRatioUtils";
import type { useVideoEditorAudio } from "../audio/useVideoEditorAudio";
import type { CaptionEditTarget } from "../captionEditing";
import type { useAnnotationRegionCommands } from "../hooks/useAnnotationRegionCommands";
import type { useEditorPlaybackControls } from "../hooks/useEditorPlaybackControls";
import type { useTimelineProjection } from "../hooks/useTimelineProjection";
import type { useZoomRegionCommands } from "../hooks/useZoomRegionCommands";
import type { useAppearanceState } from "../state/useAppearanceState";
import type { useTimelineState } from "../state/useTimelineState";
import type { TimelineEditorHandle } from "../timeline/TimelineEditor";
import type { VideoPlaybackRef } from "../VideoPlayback";
import { EditorVideoPreview } from "./EditorVideoPreview";
import { KeystrokeVisualizer } from "../keystrokes/KeystrokeVisualizer";
import { detectSilenceGapsFromCues, computeAutoTrimmedClips } from "../timeline/autoSilenceCutter";
import { toast } from "@/components/ui/toast";
import { SwissKnifeToolbar } from "../swissknife/SwissKnifeToolbar";
import { SpotlightOverlay, type SpotlightMode } from "../swissknife/SpotlightOverlay";
import { PrivacyBlurOverlay, type PrivacyMask } from "../swissknife/PrivacyBlurOverlay";
import type { ChapterMarker } from "../swissknife/ChapterMarkersModal";
import {
	DEFAULT_VOICE_ENHANCER_OPTIONS,
	type VoiceEnhancerOptions,
	studioVoiceEnhancer,
} from "../swissknife/StudioVoiceEnhancer";

type Props = {
	t: ReturnType<typeof useI18n>["t"];
	videoPath: string | null;
	previewVersion: number;
	aspectRatio: AspectRatio;
	setAspectRatio: Dispatch<SetStateAction<AspectRatio>>;
	previewAspectRatioValue: number;
	videoPlaybackRef: RefObject<VideoPlaybackRef | null>;
	timelineRef: RefObject<TimelineEditorHandle | null>;
	currentTime: number;
	isPlaying: boolean;
	previewVolume: number;
	setPreviewVolume: Dispatch<SetStateAction<number>>;
	suspendRendering: boolean;
	appearance: ReturnType<typeof useAppearanceState>;
	timeline: ReturnType<typeof useTimelineState>;
	audio: ReturnType<typeof useVideoEditorAudio>;
	projection: ReturnType<typeof useTimelineProjection>;
	playback: ReturnType<typeof useEditorPlaybackControls>;
	zoomCommands: ReturnType<typeof useZoomRegionCommands>;
	annotationCommands: ReturnType<typeof useAnnotationRegionCommands>;
	effectiveCursorTelemetry: ReturnType<typeof useTimelineState>["cursorTelemetry"];
	effectiveShowCursor: boolean;
	isCropped: boolean;
	handleOpenCropEditor: () => void;
	handleSaveAutoCaptionEdit: (target: CaptionEditTarget, text: string) => void;
	handleSelectAnnotation: (id: string | null) => void;
	setDuration: Dispatch<SetStateAction<number>>;
	isPreviewReady: boolean;
	setIsPreviewReady: Dispatch<SetStateAction<boolean>>;
	setCurrentTime: Dispatch<SetStateAction<number>>;
	setIsPlaying: Dispatch<SetStateAction<boolean>>;
	setError: (message: string | null) => void;
};

function formatTime(seconds: number) {
	if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function EditorPreviewPanel(props: Props) {
	const {
		t,
		videoPath,
		previewVersion,
		aspectRatio,
		setAspectRatio,
		previewAspectRatioValue,
		videoPlaybackRef,
		timelineRef,
		currentTime,
		isPlaying,
		previewVolume,
		setPreviewVolume,
		suspendRendering,
		appearance,
		timeline,
		audio,
		projection,
		playback,
		zoomCommands,
		annotationCommands,
		effectiveCursorTelemetry,
		effectiveShowCursor,
		isCropped,
		handleOpenCropEditor,
		handleSaveAutoCaptionEdit,
		handleSelectAnnotation,
		setDuration,
		isPreviewReady,
		setIsPreviewReady,
		setCurrentTime,
		setIsPlaying,
		setError,
	} = props;

	// Swiss Army Knife Suite State
	const [spotlightMode, setSpotlightMode] = useState<SpotlightMode>("off");
	const [privacyMasks, setPrivacyMasks] = useState<PrivacyMask[]>([]);
	const [chapters, setChapters] = useState<ChapterMarker[]>([
		{ id: "ch_intro", timeSeconds: 0, title: "Introduction" },
	]);
	const [voiceEnhancerOptions, setVoiceEnhancerOptions] = useState<VoiceEnhancerOptions>(
		DEFAULT_VOICE_ENHANCER_OPTIONS,
	);

	// Attach / update Web Audio DSP filter
	useEffect(() => {
		const videoEl = document.querySelector<HTMLVideoElement>("video");
		if (videoEl && voiceEnhancerOptions.enabled) {
			studioVoiceEnhancer.attachToMediaElement(videoEl, voiceEnhancerOptions);
		} else {
			studioVoiceEnhancer.updateSettings(voiceEnhancerOptions);
		}
	}, [voiceEnhancerOptions, isPreviewReady]);

	return (
		<div className="flex min-h-0 min-w-0 flex-1 flex-col">
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
					<div className="flex h-10 shrink-0 items-center justify-center gap-3">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
								>
									<span className="font-medium">
										{getAspectRatioLabel(aspectRatio)}
									</span>
									<CaretDown className="h-3 w-3" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="center">
								{ASPECT_RATIOS.map((ratio) => (
									<DropdownMenuItem
										key={ratio}
										onClick={() => setAspectRatio(ratio)}
										className="flex cursor-pointer items-center justify-between gap-3 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
									>
										<span>{getAspectRatioLabel(ratio)}</span>
										{aspectRatio === ratio ? (
											<Check className="h-3 w-3 text-[#2563EB]" />
										) : null}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
						<div className="h-4 w-px bg-foreground/20" />
						<Button
							variant="ghost"
							size="sm"
							onClick={handleOpenCropEditor}
							className="h-7 gap-1.5 px-2 text-xs"
						>
							<Crop className="h-3.5 w-3.5" />
							<span className="font-medium">{t("settings.crop.title")}</span>
							{isCropped ? (
								<span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
							) : null}
						</Button>
						<div className="h-4 w-px bg-foreground/20" />
						<SwissKnifeToolbar
							spotlightMode={spotlightMode}
							setSpotlightMode={setSpotlightMode}
							privacyMasks={privacyMasks}
							setPrivacyMasks={setPrivacyMasks}
							chapters={chapters}
							setChapters={setChapters}
							currentTime={currentTime}
							duration={projection.timelineDuration}
							onSeekToTime={(time) => {
								playback.handleSeek(time);
							}}
							voiceEnhancerOptions={voiceEnhancerOptions}
							setVoiceEnhancerOptions={setVoiceEnhancerOptions}
						/>
					</div>
					<div
						className="flex min-h-0 w-full flex-1 items-stretch px-4 py-3"
						style={{ flex: "1 1 auto", margin: 0 }}
					>
						<div
							className="editor-preview-stage flex min-h-0 min-w-0 flex-1 items-center justify-center"
							style={{ containerType: "size" }}
						>
							<div
								className="editor-preview-frame relative"
								style={{
									width: `min(100cqw, calc(100cqh * ${previewAspectRatioValue}))`,
									height: `min(100cqh, calc(100cqw / ${previewAspectRatioValue}))`,
									aspectRatio: previewAspectRatioValue,
									maxWidth: "100%",
									margin: "0 auto",
									boxSizing: "border-box",
								}}
							>
								{videoPath && !isPreviewReady && (
									<Skeleton
										aria-label="Loading preview"
										className="pointer-events-none absolute inset-0 z-20 h-full w-full rounded-xl"
									/>
								)}
								<EditorVideoPreview
									videoPath={videoPath}
									previewVersion={previewVersion}
									aspectRatio={aspectRatio}
									playbackRef={videoPlaybackRef}
									currentTime={currentTime}
									isPlaying={isPlaying}
									previewVolume={previewVolume}
									suspendRendering={suspendRendering}
									appearance={appearance}
									timeline={timeline}
									audio={audio}
									effectiveZoomRegions={projection.effectiveZoomRegions}
									effectiveCursorTelemetry={effectiveCursorTelemetry}
									effectiveShowCursor={effectiveShowCursor}
									setDuration={setDuration}
									setIsPreviewReady={setIsPreviewReady}
									setCurrentTime={setCurrentTime}
									setIsPlaying={setIsPlaying}
									setError={setError}
									handlers={{
										onSelectZoom: zoomCommands.handleSelectZoom,
										onZoomFocusChange: zoomCommands.handleZoomFocusChange,
										onEditAutoCaption: handleSaveAutoCaptionEdit,
										onSelectAnnotation: handleSelectAnnotation,
										onAnnotationPositionChange:
											annotationCommands.handleAnnotationPositionChange,
										onAnnotationSizeChange:
											annotationCommands.handleAnnotationSizeChange,
									}}
								/>
								<SpotlightOverlay mode={spotlightMode} />
								<PrivacyBlurOverlay
									enabled={true}
									masks={privacyMasks}
									onUpdateMasks={setPrivacyMasks}
								/>
								<KeystrokeVisualizer
									enabled={true}
									position="bottom-center"
									theme="glass-dark"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="editor-playback relative grid min-h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
				<div className="editor-playback-tools z-10 flex min-w-0 items-center gap-2">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="sm" className="h-9 gap-2 px-3">
								<Plus className="h-3.5 w-3.5" />
								<span className="font-medium">{t("editor.toolbar.addLayer")}</span>
								<CaretDown className="h-3 w-3" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuItem
								onClick={() => {
									const nextTrack =
										timeline.annotationRegions.length > 0
											? Math.max(
													...timeline.annotationRegions.map(
														(region) => region.trackIndex ?? 0,
													),
												) + 1
											: 0;
									timelineRef.current?.addAnnotation(nextTrack);
								}}
								className="cursor-pointer text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
							>
								{t("timeline.annotation.label")}
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => {
									const nextTrack =
										timeline.audioRegions.length > 0
											? Math.max(
													...timeline.audioRegions.map(
														(region) => region.trackIndex ?? 0,
													),
												) + 1
											: 0;
									timelineRef.current?.addAudio(nextTrack);
								}}
								className="cursor-pointer text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
							>
								{t("timeline.audio.label")}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<Button
						onClick={() => timelineRef.current?.addZoom()}
						variant="ghost"
						size="icon"
						className="h-9 w-9"
						title={t("timeline.zoom.addZoom")}
					>
						<MagnifyingGlassPlus className="h-4 w-4" />
					</Button>
					<Button
						onClick={() => timelineRef.current?.suggestZooms()}
						variant="ghost"
						size="icon"
						className="h-9 w-9"
						title={t("timeline.zoom.suggestZooms")}
					>
						<MagicWand className="h-4 w-4" />
					</Button>
					<Button
						onClick={() => timelineRef.current?.splitClip()}
						variant="ghost"
						size="icon"
						className="h-9 w-9"
						title={t("editor.toolbar.splitClip")}
					>
						<Scissors className="h-4 w-4" />
					</Button>
					<Button
						onClick={() => {
							const duration = projection.timelineDuration;
							if (!duration || duration <= 0) {
								toast.error("No active video loaded to auto-cut.");
								return;
							}
							const gaps = detectSilenceGapsFromCues(timeline.autoCaptions, duration, {
								minSilenceDurationMs: 1200,
							});
							if (gaps.length === 0) {
								toast.info("No long silences detected (>1.2s). Timeline pacing is already clean!");
								return;
							}
							const newClips = computeAutoTrimmedClips(gaps, duration, timeline.clipRegions);
							timeline.setClipRegions(newClips);
							toast.success(`Smart Auto-Cut: trimmed ${gaps.length} dead-air pause${gaps.length > 1 ? "s" : ""}!`);
						}}
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
						title="Auto-Cut Silences (AI Jump-Cut)"
					>
						<Lightning className="h-4 w-4" weight="fill" />
					</Button>
					<Button
						onClick={() => {
							try {
								const canvas = document.querySelector<HTMLCanvasElement>("div[data-preview-overlay] canvas, .relative canvas");
								if (canvas) {
									const dataUrl = canvas.toDataURL("image/png");
									const link = document.createElement("a");
									link.download = `VGRECORD-snapshot-${Math.round(currentTime * 100) / 100}s.png`;
									link.href = dataUrl;
									link.click();
									toast.success("Cover snapshot saved as PNG!");
									return;
								}
								const videoEl = document.querySelector<HTMLVideoElement>("video");
								if (!videoEl) {
									toast.error("No active video frame to capture.");
									return;
								}
								const offscreen = document.createElement("canvas");
								offscreen.width = videoEl.videoWidth || 1920;
								offscreen.height = videoEl.videoHeight || 1080;
								const ctx = offscreen.getContext("2d");
								if (!ctx) return;
								ctx.drawImage(videoEl, 0, 0, offscreen.width, offscreen.height);
								const dataUrl = offscreen.toDataURL("image/png");
								const link = document.createElement("a");
								link.download = `VGRECORD-snapshot-${Math.round(currentTime * 100) / 100}s.png`;
								link.href = dataUrl;
								link.click();
								toast.success("Cover snapshot saved as PNG!");
							} catch {
								toast.error("Failed to capture snapshot.");
							}
						}}
						variant="ghost"
						size="icon"
						className="h-9 w-9 text-sky-500 hover:text-sky-400 hover:bg-sky-500/10"
						title="Capture Frame Snapshot / Cover Thumbnail (PNG)"
					>
						<Camera className="h-4 w-4" />
					</Button>
				</div>

				<div className="editor-playback-center z-10 flex items-center justify-center">
					<div className="pointer-events-auto flex items-center gap-1.5">
						<span className="mr-1 text-[10px] font-medium tabular-nums text-muted-foreground">
							{formatTime(projection.timelinePlayheadTime)}
						</span>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9"
							title={t("editor.playback.skipBack")}
							onClick={playback.handlePreviewSkipBack}
						>
							<SkipBack className="h-3.5 w-3.5" weight="fill" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className={`h-9 w-9  ${isPlaying ? "bg-foreground/10 text-foreground hover:bg-foreground/20" : "bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-white/90"} `}
							onClick={playback.togglePlayPause}
							title={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? (
								<Pause className="h-3.5 w-3.5" weight="fill" />
							) : (
								<Play className="h-3.5 w-3.5" weight="fill" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9"
							title={t("editor.playback.skipForward")}
							onClick={playback.handlePreviewSkipForward}
						>
							<SkipForward className="h-3.5 w-3.5" weight="fill" />
						</Button>
						<span className="ml-1 text-[10px] font-medium tabular-nums text-muted-foreground/70">
							{formatTime(projection.timelineDuration)}
						</span>
					</div>
				</div>

				<div className="editor-playback-volume z-10 ml-auto flex items-center">
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								aria-label={t("editor.playback.volume", "Preview volume")}
								title={t("editor.playback.volume", "Preview volume")}
							>
								{previewVolume <= 0.001 ? (
									<SpeakerX className="size-3.5" />
								) : previewVolume < 0.5 ? (
									<SpeakerLow className="size-3.5" />
								) : (
									<SpeakerHigh className="size-3.5" />
								)}
							</Button>
						</PopoverTrigger>
						<PopoverContent
							side="top"
							sideOffset={10}
							aria-label="Preview volume"
							className="flex w-14 flex-col items-center gap-3 p-3"
						>
							<span className="text-[10px] tabular-nums text-muted-foreground">
								{Math.round(previewVolume * 100)}%
							</span>
							<Slider
								aria-label={t("editor.playback.volume", "Preview volume")}
								orientation="vertical"
								min={0}
								max={1}
								step={0.01}
								value={[previewVolume]}
								onValueChange={([value]) => setPreviewVolume(value)}
								className="h-28"
							/>
						</PopoverContent>
					</Popover>
				</div>
			</div>
		</div>
	);
}
