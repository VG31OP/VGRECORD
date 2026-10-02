/**
 * VGRECORD - Studio Voice AI DSP & Vocal Enhancer Engine
 * Built-in Web Audio filters for studio broadcast audio:
 * - De-Hum / Highpass (80Hz rumble cut)
 * - Speech Presence / Clarity EQ (3.5kHz boost)
 * - Dynamic Broadcast Compression (Leveler & Limiter)
 */

export interface VoiceEnhancerOptions {
	enabled: boolean;
	clarityBoost: boolean; // Boost 3.5kHz speech presence
	deHum: boolean; // Cut <80Hz low rumble and fan hum
	compression: boolean; // Studio dynamics leveling
	masterGain: number; // 0.0 - 2.0
}

export const DEFAULT_VOICE_ENHANCER_OPTIONS: VoiceEnhancerOptions = {
	enabled: false,
	clarityBoost: true,
	deHum: true,
	compression: true,
	masterGain: 1.0,
};

export class StudioVoiceEnhancer {
	private audioCtx: AudioContext | null = null;
	private sourceNode: MediaElementAudioSourceNode | null = null;
	private highpassNode: BiquadFilterNode | null = null;
	private clarityNode: BiquadFilterNode | null = null;
	private compressorNode: DynamicsCompressorNode | null = null;
	private gainNode: GainNode | null = null;
	private isAttached = false;

	public attachToMediaElement(
		audioElement: HTMLMediaElement,
		options: VoiceEnhancerOptions = DEFAULT_VOICE_ENHANCER_OPTIONS,
	): void {
		try {
			if (this.isAttached && this.audioCtx) {
				this.updateSettings(options);
				return;
			}

			const AudioContextClass =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

			if (!AudioContextClass) return;

			this.audioCtx = new AudioContextClass();
			if (this.audioCtx.state === "suspended") {
				void this.audioCtx.resume();
			}

			this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);

			// 1. High-Pass Filter (80Hz rumble / AC hum cut)
			this.highpassNode = this.audioCtx.createBiquadFilter();
			this.highpassNode.type = "highpass";
			this.highpassNode.frequency.value = options.deHum ? 80 : 20;
			this.highpassNode.Q.value = 0.7;

			// 2. Clarity Presence Filter (3.5kHz peaking boost)
			this.clarityNode = this.audioCtx.createBiquadFilter();
			this.clarityNode.type = "peaking";
			this.clarityNode.frequency.value = 3500;
			this.clarityNode.gain.value = options.clarityBoost ? 4.5 : 0;
			this.clarityNode.Q.value = 1.0;

			// 3. Studio Dynamic Compressor
			this.compressorNode = this.audioCtx.createDynamicsCompressor();
			this.compressorNode.threshold.value = options.compression ? -20 : 0;
			this.compressorNode.knee.value = 8;
			this.compressorNode.ratio.value = options.compression ? 3.5 : 1;
			this.compressorNode.attack.value = 0.003;
			this.compressorNode.release.value = 0.25;

			// 4. Output Gain Level
			this.gainNode = this.audioCtx.createGain();
			this.gainNode.gain.value = options.masterGain;

			// Connect Web Audio chain
			this.sourceNode.connect(this.highpassNode);
			this.highpassNode.connect(this.clarityNode);
			this.clarityNode.connect(this.compressorNode);
			this.compressorNode.connect(this.gainNode);
			this.gainNode.connect(this.audioCtx.destination);

			this.isAttached = true;
		} catch {
			// MediaElementSource might already be attached
		}
	}

	public updateSettings(options: VoiceEnhancerOptions): void {
		if (!this.audioCtx) return;

		if (this.highpassNode) {
			this.highpassNode.frequency.value = options.enabled && options.deHum ? 80 : 20;
		}

		if (this.clarityNode) {
			this.clarityNode.gain.value = options.enabled && options.clarityBoost ? 4.5 : 0;
		}

		if (this.compressorNode) {
			this.compressorNode.threshold.value = options.enabled && options.compression ? -20 : 0;
			this.compressorNode.ratio.value = options.enabled && options.compression ? 3.5 : 1;
		}

		if (this.gainNode) {
			this.gainNode.gain.value = options.masterGain;
		}
	}

	public disconnect(): void {
		if (this.audioCtx && this.audioCtx.state !== "closed") {
			void this.audioCtx.close();
		}
		this.isAttached = false;
	}
}

export const studioVoiceEnhancer = new StudioVoiceEnhancer();
