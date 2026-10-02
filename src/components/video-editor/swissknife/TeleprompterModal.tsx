import { useState, useEffect, useRef, type ChangeEvent } from "react";
import {
	Article,
	Play,
	Pause,
	ArrowClockwise,
	TextAa,
	SlidersHorizontal,
	ArrowsClockwise,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface TeleprompterModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function TeleprompterModal({ isOpen, onClose }: TeleprompterModalProps) {
	const [script, setScript] = useState(
		"Welcome to this video walkthrough!\n\nIn this demo, we'll explore the key features of VGRECORD — the open-source screen recorder with built-in auto-zoom, dynamic webcam bubbles, and studio sound.\n\nKeep looking straight into your webcam for maximum audience connection.\n\nTake your time, speak clearly, and have fun!",
	);
	const [isScrolling, setIsScrolling] = useState(false);
	const [scrollSpeed, setScrollSpeed] = useState(2); // 1 to 5
	const [fontSize, setFontSize] = useState(24); // px
	const [isMirrored, setIsMirrored] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isScrolling) return;

		const interval = setInterval(() => {
			if (scrollContainerRef.current) {
				scrollContainerRef.current.scrollTop += scrollSpeed * 0.75;
				if (
					scrollContainerRef.current.scrollTop >=
					scrollContainerRef.current.scrollHeight - scrollContainerRef.current.clientHeight
				) {
					setIsScrolling(false);
				}
			}
		}, 30);

		return () => clearInterval(interval);
	}, [isScrolling, scrollSpeed]);

	// Spacebar shortcut to pause/play
	useEffect(() => {
		if (!isOpen || isEditing) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.code === "Space" && !["TEXTAREA", "INPUT"].includes((e.target as HTMLElement).tagName)) {
				e.preventDefault();
				setIsScrolling((prev) => !prev);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, isEditing]);

	const handleReset = () => {
		setIsScrolling(false);
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTop = 0;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-xl bg-neutral-950/95 border-neutral-800 text-neutral-100 p-6 backdrop-blur-2xl">
				<DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-neutral-800">
					<DialogTitle className="flex items-center gap-2 text-base font-semibold text-white">
						<Article className="w-5 h-5 text-indigo-400" />
						<span>Presenter Studio Teleprompter</span>
					</DialogTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsEditing(!isEditing)}
						className="h-7 px-2 text-xs text-indigo-300 hover:text-indigo-200 hover:bg-indigo-950/50"
					>
						{isEditing ? "Done Editing" : "Edit Script"}
					</Button>
				</DialogHeader>

				<div className="space-y-4 pt-2">
					{isEditing ? (
						<textarea
							value={script}
							onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setScript(e.target.value)}
							rows={10}
							className="w-full p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:ring-indigo-500 focus:outline-none resize-none"
							placeholder="Type or paste your presenter script here..."
						/>
					) : (
						<div
							ref={scrollContainerRef}
							style={{
								fontSize: `${fontSize}px`,
								transform: isMirrored ? "scaleX(-1)" : "none",
							}}
							className="h-64 overflow-y-auto px-6 py-10 rounded-xl bg-neutral-900/80 border border-neutral-800/80 text-center font-medium leading-relaxed select-none scrollbar-none text-white transition-all"
						>
							{script.split("\n\n").map((paragraph, idx) => (
								<p key={idx} className="mb-8 opacity-90 hover:opacity-100 transition-opacity">
									{paragraph}
								</p>
							))}
							<div className="h-32" />
						</div>
					)}

					{/* Control Bar */}
					<div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800">
						{/* Playback buttons */}
						<div className="flex items-center gap-2">
							<Button
								size="sm"
								onClick={() => setIsScrolling(!isScrolling)}
								className={`h-8 gap-1.5 px-3 font-medium text-xs ${
									isScrolling
										? "bg-amber-600 hover:bg-amber-500 text-white"
										: "bg-indigo-600 hover:bg-indigo-500 text-white"
								}`}
							>
								{isScrolling ? <Pause className="w-3.5 h-3.5" weight="fill" /> : <Play className="w-3.5 h-3.5" weight="fill" />}
								<span>{isScrolling ? "Pause (Space)" : "Scroll (Space)"}</span>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={handleReset}
								className="h-8 w-8 text-neutral-400 hover:text-white"
								title="Reset to Top"
							>
								<ArrowClockwise className="w-3.5 h-3.5" />
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsMirrored(!isMirrored)}
								className={`h-8 w-8 ${isMirrored ? "text-indigo-400 bg-indigo-950/50" : "text-neutral-400 hover:text-white"}`}
								title="Mirror text (for beam-splitter teleprompters)"
							>
								<ArrowsClockwise className="w-3.5 h-3.5" />
							</Button>
						</div>

						{/* Sliders */}
						<div className="flex items-center gap-4 text-xs text-neutral-400">
							{/* Speed Slider */}
							<div className="flex items-center gap-2">
								<SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400" />
								<span className="text-[10px] w-8">Speed: {scrollSpeed}x</span>
								<Slider
									min={1}
									max={5}
									step={0.5}
									value={[scrollSpeed]}
									onValueChange={([val]) => setScrollSpeed(val)}
									className="w-16"
								/>
							</div>

							{/* Font Size Slider */}
							<div className="flex items-center gap-2">
								<TextAa className="w-3.5 h-3.5 text-neutral-400" />
								<Slider
									min={16}
									max={42}
									step={2}
									value={[fontSize]}
									onValueChange={([val]) => setFontSize(val)}
									className="w-16"
								/>
							</div>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
