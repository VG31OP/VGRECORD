/**
 * Web Audio API based Click Sound Synthesizer for VGRECORD.
 * Generates high-fidelity, studio-grade procedural mouse click sound effects
 * with zero external asset dependencies.
 */

export type ClickSoundPreset =
	| "modern"
	| "mechanical"
	| "pop"
	| "snap"
	| "thud";

export interface ClickSoundOptions {
	preset?: ClickSoundPreset;
	volume?: number; // 0.0 to 1.0
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!audioCtx) {
		const AudioContextClass =
			window.AudioContext ||
			(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
		if (AudioContextClass) {
			audioCtx = new AudioContextClass();
		}
	}
	if (audioCtx && audioCtx.state === "suspended") {
		void audioCtx.resume();
	}
	return audioCtx;
}

/**
 * Play a synthesized click sound in real time.
 */
export function playClickSound(options?: ClickSoundOptions): void {
	const ctx = getAudioContext();
	if (!ctx) return;

	const preset = options?.preset ?? "modern";
	const volume = Math.max(0, Math.min(1, options?.volume ?? 0.7));
	if (volume <= 0.001) return;

	const now = ctx.currentTime;
	const masterGain = ctx.createGain();
	masterGain.gain.setValueAtTime(volume * 0.85, now);
	masterGain.connect(ctx.destination);

	switch (preset) {
		case "mechanical": {
			// Tactile microswitch click (dual transient click + release acoustic snap)
			const osc1 = ctx.createOscillator();
			const osc2 = ctx.createOscillator();
			const gain1 = ctx.createGain();
			const gain2 = ctx.createGain();

			osc1.type = "sine";
			osc1.frequency.setValueAtTime(2400, now);
			osc1.frequency.exponentialRampToValueAtTime(320, now + 0.012);

			gain1.gain.setValueAtTime(0.9, now);
			gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

			osc2.type = "triangle";
			osc2.frequency.setValueAtTime(4800, now + 0.002);
			osc2.frequency.exponentialRampToValueAtTime(800, now + 0.02);

			gain2.gain.setValueAtTime(0.0001, now);
			gain2.gain.setValueAtTime(0.6, now + 0.002);
			gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

			osc1.connect(gain1);
			osc2.connect(gain2);
			gain1.connect(masterGain);
			gain2.connect(masterGain);

			osc1.start(now);
			osc2.start(now);
			osc1.stop(now + 0.025);
			osc2.stop(now + 0.025);
			break;
		}

		case "pop": {
			// Soft rounded bubble pop
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(450, now);
			osc.frequency.exponentialRampToValueAtTime(1200, now + 0.015);
			osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

			gain.gain.setValueAtTime(0.8, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

			osc.connect(gain);
			gain.connect(masterGain);

			osc.start(now);
			osc.stop(now + 0.05);
			break;
		}

		case "snap": {
			// Crisp snap with high pass noise burst
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "square";
			osc.frequency.setValueAtTime(3200, now);
			osc.frequency.exponentialRampToValueAtTime(600, now + 0.01);

			gain.gain.setValueAtTime(0.7, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);

			osc.connect(gain);
			gain.connect(masterGain);

			osc.start(now);
			osc.stop(now + 0.02);
			break;
		}

		case "thud": {
			// Muted low-frequency soft thud
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(600, now);
			osc.frequency.exponentialRampToValueAtTime(90, now + 0.035);

			gain.gain.setValueAtTime(0.9, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

			osc.connect(gain);
			gain.connect(masterGain);

			osc.start(now);
			osc.stop(now + 0.045);
			break;
		}

		case "modern":
		default: {
			// Modern crisp UI click (clean Loom / Apple style)
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();

			osc.type = "sine";
			osc.frequency.setValueAtTime(1800, now);
			osc.frequency.exponentialRampToValueAtTime(400, now + 0.018);

			gain.gain.setValueAtTime(0.85, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

			osc.connect(gain);
			gain.connect(masterGain);

			osc.start(now);
			osc.stop(now + 0.025);
			break;
		}
	}
}

export const CLICK_SOUND_PRESET_OPTIONS: Array<{
	id: ClickSoundPreset;
	label: string;
	description: string;
}> = [
	{
		id: "modern",
		label: "Modern Crisp",
		description: "Clean, balanced contemporary click",
	},
	{
		id: "mechanical",
		label: "Mechanical Switch",
		description: "Satisfying tactile mouse switch",
	},
	{
		id: "pop",
		label: "Soft Pop",
		description: "Gentle rounded bubble pop",
	},
	{
		id: "snap",
		label: "Tactile Snap",
		description: "Sharp and punchy high-frequency snap",
	},
	{
		id: "thud",
		label: "Muted Tap",
		description: "Subtle low-frequency muted tap",
	},
];

export type TypingSoundPreset = "mechanical-blue" | "thocky-linear" | "typewriter" | "soft-laptop";

export interface TypingSoundOptions {
	preset?: TypingSoundPreset;
	volume?: number;
}

export function playTypingSound(options?: TypingSoundOptions): void {
	const ctx = getAudioContext();
	if (!ctx) return;

	const preset = options?.preset ?? "thocky-linear";
	const volume = Math.max(0, Math.min(1, options?.volume ?? 0.6));
	if (volume <= 0.001) return;

	const now = ctx.currentTime;
	const masterGain = ctx.createGain();
	masterGain.gain.setValueAtTime(volume * 0.75, now);
	masterGain.connect(ctx.destination);

	switch (preset) {
		case "mechanical-blue": {
			// Clicky switch (crisp click + deep bottom-out thump)
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(3200, now);
			osc.frequency.exponentialRampToValueAtTime(600, now + 0.015);
			gain.gain.setValueAtTime(0.8, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
			osc.connect(gain);
			gain.connect(masterGain);
			osc.start(now);
			osc.stop(now + 0.025);
			break;
		}
		case "typewriter": {
			// Vintage mechanical typewriter clack
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "triangle";
			osc.frequency.setValueAtTime(1400, now);
			osc.frequency.exponentialRampToValueAtTime(220, now + 0.03);
			gain.gain.setValueAtTime(0.9, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
			osc.connect(gain);
			gain.connect(masterGain);
			osc.start(now);
			osc.stop(now + 0.04);
			break;
		}
		case "soft-laptop": {
			// Quiet low-profile scissor switch
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(800, now);
			osc.frequency.exponentialRampToValueAtTime(300, now + 0.012);
			gain.gain.setValueAtTime(0.5, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015);
			osc.connect(gain);
			gain.connect(masterGain);
			osc.start(now);
			osc.stop(now + 0.02);
			break;
		}
		case "thocky-linear":
		default: {
			// Deep lubed linear "thock"
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(480, now);
			osc.frequency.exponentialRampToValueAtTime(120, now + 0.022);
			gain.gain.setValueAtTime(0.95, now);
			gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
			osc.connect(gain);
			gain.connect(masterGain);
			osc.start(now);
			osc.stop(now + 0.032);
			break;
		}
	}
}

export const TYPING_SOUND_PRESET_OPTIONS: Array<{
	id: TypingSoundPreset;
	label: string;
	description: string;
}> = [
	{
		id: "thocky-linear",
		label: "Thocky Linear",
		description: "Deep, satisfying custom mechanical keyboard thock",
	},
	{
		id: "mechanical-blue",
		label: "Clicky Blue",
		description: "Tactile crisp clicky mechanical switch",
	},
	{
		id: "soft-laptop",
		label: "Low-Profile Laptop",
		description: "Quiet, refined scissor-switch tap",
	},
	{
		id: "typewriter",
		label: "Classic Typewriter",
		description: "Vintage acoustic mechanical clack",
	},
];

