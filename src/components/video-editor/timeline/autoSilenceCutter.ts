import type { ClipRegion } from "../types";

export interface SilenceDetectionOptions {
	minSilenceDurationMs?: number; // Minimum pause duration to cut (e.g. 600ms)
	silencePaddingMs?: number;     // Buffer margin before/after speech to keep it natural (e.g. 80ms)
}

export interface SilenceSegment {
	startMs: number;
	endMs: number;
	durationMs: number;
}

/**
 * Detect silence gaps based on caption timestamp intervals or audio silence cues.
 */
export function detectSilenceGapsFromCues(
	cues: Array<{ startMs: number; endMs: number }>,
	totalDurationSec: number,
	options?: SilenceDetectionOptions,
): SilenceSegment[] {
	const minSilence = options?.minSilenceDurationMs ?? 600;
	const padding = options?.silencePaddingMs ?? 80;
	const totalDurationMs = Math.round(totalDurationSec * 1000);

	if (!cues || cues.length === 0) {
		return [];
	}

	const sorted = [...cues].sort((a, b) => a.startMs - b.startMs);
	const silences: SilenceSegment[] = [];

	// Leading silence before first speech
	if (sorted[0].startMs > minSilence + padding) {
		silences.push({
			startMs: 0,
			endMs: Math.max(0, sorted[0].startMs - padding),
			durationMs: Math.max(0, sorted[0].startMs - padding),
		});
	}

	// In-between pauses
	for (let i = 0; i < sorted.length - 1; i++) {
		const currentEnd = sorted[i].endMs + padding;
		const nextStart = sorted[i + 1].startMs - padding;
		const gap = nextStart - currentEnd;

		if (gap >= minSilence) {
			silences.push({
				startMs: currentEnd,
				endMs: nextStart,
				durationMs: gap,
			});
		}
	}

	// Trailing silence after last speech
	const lastEnd = sorted[sorted.length - 1].endMs + padding;
	if (totalDurationMs - lastEnd >= minSilence) {
		silences.push({
			startMs: lastEnd,
			endMs: totalDurationMs,
			durationMs: totalDurationMs - lastEnd,
		});
	}

	return silences;
}

/**
 * Computes newly trimmed clip regions by slicing away identified silence intervals.
 */
export function computeAutoTrimmedClips(
	silences: SilenceSegment[],
	totalDurationSec: number,
	existingClips: ClipRegion[] = [],
): ClipRegion[] {
	const totalDurationMs = Math.round(totalDurationSec * 1000);
	const clipsToProcess =
		existingClips.length > 0
			? existingClips
			: [
					{
						id: crypto.randomUUID(),
						startMs: 0,
						endMs: totalDurationMs,
						sourceStartMs: 0,
						speed: 1,
					},
				];

	if (silences.length === 0) {
		return clipsToProcess;
	}

	const resultClips: ClipRegion[] = [];
	let runningTimelineStartMs = 0;

	for (const clip of clipsToProcess) {
		let currentRanges: Array<{ startMs: number; endMs: number; sourceStartMs: number }> = [
			{
				startMs: clip.startMs,
				endMs: clip.endMs,
				sourceStartMs: clip.sourceStartMs ?? clip.startMs,
			},
		];

		for (const silence of silences) {
			const nextRanges: typeof currentRanges = [];
			for (const range of currentRanges) {
				// No overlap
				if (silence.endMs <= range.startMs || silence.startMs >= range.endMs) {
					nextRanges.push(range);
					continue;
				}

				// Left segment before silence
				if (silence.startMs > range.startMs) {
					nextRanges.push({
						startMs: range.startMs,
						endMs: silence.startMs,
						sourceStartMs: range.sourceStartMs,
					});
				}

				// Right segment after silence
				if (silence.endMs < range.endMs) {
					const cutOffset = silence.endMs - range.startMs;
					nextRanges.push({
						startMs: silence.endMs,
						endMs: range.endMs,
						sourceStartMs: range.sourceStartMs + cutOffset,
					});
				}
			}
			currentRanges = nextRanges;
		}

		// Rebuild non-empty split clip pieces
		for (const r of currentRanges) {
			const duration = r.endMs - r.startMs;
			if (duration > 150) {
				resultClips.push({
					...clip,
					id: crypto.randomUUID(),
					startMs: runningTimelineStartMs,
					endMs: runningTimelineStartMs + duration,
					sourceStartMs: r.sourceStartMs,
					speed: clip.speed ?? 1,
				});
				runningTimelineStartMs += duration;
			}
		}
	}

	return resultClips;
}
