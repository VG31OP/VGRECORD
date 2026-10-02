import { useState } from "react";
import {
	BookmarkSimple,
	Copy,
	Check,
	Trash,
	Plus,
	Play,
	Clock,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

export interface ChapterMarker {
	id: string;
	timeSeconds: number;
	title: string;
}

interface ChapterMarkersModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentTime: number;
	duration: number;
	chapters: ChapterMarker[];
	onUpdateChapters: (chapters: ChapterMarker[]) => void;
	onSeekToTime: (timeSeconds: number) => void;
}

function formatTimestamp(seconds: number): string {
	const totalSec = Math.max(0, Math.floor(seconds));
	const mins = Math.floor(totalSec / 60);
	const secs = totalSec % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function ChapterMarkersModal({
	isOpen,
	onClose,
	currentTime,
	chapters,
	onUpdateChapters,
	onSeekToTime,
}: ChapterMarkersModalProps) {
	const [newTitle, setNewTitle] = useState("");
	const [copied, setCopied] = useState(false);

	const handleAddMarker = () => {
		const title = newTitle.trim() || `Chapter ${chapters.length + 1}`;
		const newMarker: ChapterMarker = {
			id: `ch_${Date.now()}`,
			timeSeconds: currentTime,
			title,
		};
		const sorted = [...chapters, newMarker].sort((a, b) => a.timeSeconds - b.timeSeconds);
		onUpdateChapters(sorted);
		setNewTitle("");
		toast.success(`Added chapter "${title}" at ${formatTimestamp(currentTime)}`);
	};

	const handleDeleteMarker = (id: string) => {
		onUpdateChapters(chapters.filter((c) => c.id !== id));
	};

	const handleCopyYouTubeFormat = () => {
		if (chapters.length === 0) {
			toast.error("No chapters to export.");
			return;
		}
		// Ensure 00:00 starts if missing
		let exportList = [...chapters].sort((a, b) => a.timeSeconds - b.timeSeconds);
		if (exportList.length > 0 && exportList[0].timeSeconds > 0.5) {
			exportList = [{ id: "intro", timeSeconds: 0, title: "Intro" }, ...exportList];
		}
		const text = exportList
			.map((c) => `${formatTimestamp(c.timeSeconds)} ${c.title}`)
			.join("\n");

		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
		toast.success("Copied YouTube & Loom timestamps to clipboard!");
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-md bg-neutral-900 border-neutral-800 text-neutral-100 p-6">
				<DialogHeader className="space-y-1">
					<DialogTitle className="flex items-center gap-2 text-lg font-semibold text-white">
						<BookmarkSimple className="w-5 h-5 text-indigo-400" weight="fill" />
						<span>Timeline Chapters & Timestamps</span>
					</DialogTitle>
					<p className="text-xs text-neutral-400">
						Add time markers and generate 1-click formatted YouTube/Loom timestamps.
					</p>
				</DialogHeader>

				<div className="space-y-4 pt-3">
					{/* Add Chapter Input */}
					<div className="flex gap-2">
						<div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-800 border border-neutral-700 text-xs font-mono text-indigo-300">
							<Clock className="w-3.5 h-3.5" />
							<span>{formatTimestamp(currentTime)}</span>
						</div>
						<Input
							placeholder="Chapter title (e.g. Overview, Setup)..."
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAddMarker()}
							className="h-9 bg-neutral-800 border-neutral-700 text-xs text-white"
						/>
						<Button
							size="sm"
							onClick={handleAddMarker}
							className="h-9 gap-1 bg-indigo-600 hover:bg-indigo-500 text-white"
						>
							<Plus className="w-3.5 h-3.5" />
							<span>Add</span>
						</Button>
					</div>

					{/* Chapter List */}
					<div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
						{chapters.length === 0 ? (
							<div className="py-6 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-lg">
								No chapters added yet. Pause the video and add markers at key points!
							</div>
						) : (
							chapters.map((chapter) => (
								<div
									key={chapter.id}
									className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 border border-neutral-800 hover:border-neutral-700 transition-colors"
								>
									<button
										onClick={() => {
											onSeekToTime(chapter.timeSeconds);
											toast.info(`Jumped to ${chapter.title}`);
										}}
										className="flex items-center gap-2 text-left hover:text-indigo-400 transition-colors"
									>
										<span className="px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-indigo-300 border border-neutral-700">
											{formatTimestamp(chapter.timeSeconds)}
										</span>
										<span className="text-xs font-medium text-neutral-200">
											{chapter.title}
										</span>
									</button>

									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => onSeekToTime(chapter.timeSeconds)}
											className="h-7 w-7 text-neutral-400 hover:text-white"
											title="Jump to time"
										>
											<Play className="w-3 h-3" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleDeleteMarker(chapter.id)}
											className="h-7 w-7 text-neutral-400 hover:text-red-400"
											title="Delete chapter"
										>
											<Trash className="w-3 h-3" />
										</Button>
									</div>
								</div>
							))
						)}
					</div>

					{/* Copy Button */}
					<div className="pt-2 flex justify-between items-center border-t border-neutral-800">
						<span className="text-[11px] text-neutral-400">
							{chapters.length} chapter{chapters.length !== 1 ? "s" : ""}
						</span>
						<Button
							onClick={handleCopyYouTubeFormat}
							className="gap-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs h-8 px-3"
						>
							{copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
							<span>{copied ? "Copied!" : "Copy YouTube Format"}</span>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
