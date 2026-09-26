export type AudioTrack = {
  passageRef: string;
  audioSrc: string;
  previousChapter: string | null;
  nextChapter: string | null;
  passageUrl: string;
};

export type PlaybackMode = "stop" | "repeat" | "continuous";
export type PlaybackSnapshot = {
  track: AudioTrack | null;
  isPlaying: boolean;
  isNavigating: boolean;
  error: string | null;
};

// Own the media element independently of React renders and passage navigation.
export class PlaybackController {
  private snapshot: PlaybackSnapshot = {
    track: null, isPlaying: false, isNavigating: false, error: null,
  };
  private revision = 0;
  private cache = new Map<string, AudioTrack>();
  private pending = new Map<string, Promise<AudioTrack>>();
  private mode: PlaybackMode = "stop";
  private speed = 1;

  constructor(
    private audio: HTMLAudioElement,
    private loadChapter: (reference: string) => Promise<AudioTrack>,
    private notify: (snapshot: PlaybackSnapshot) => void,
  ) {
    audio.addEventListener("ended", this.onEnded);
    audio.addEventListener("playing", this.onPlaying);
    audio.addEventListener("pause", this.onPause);
    audio.addEventListener("error", this.onError);
  }

  private update(patch: Partial<PlaybackSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.notify(this.snapshot);
  }

  private onPlaying = () => this.update({ isPlaying: true, error: null });
  private onPause = () => this.update({ isPlaying: false });
  private onError = () => this.update({
    isPlaying: false,
    error: "Audio could not load. Check your connection and press play to retry.",
  });
  private onEnded = () => {
    this.update({ isPlaying: false });
    if (this.mode === "continuous" && this.snapshot.track?.nextChapter) {
      // The prepared path changes src and calls play synchronously in ended.
      // No route change, React effect, or metadata request gates this handoff.
      this.goToChapter(this.snapshot.track.nextChapter);
    }
  };

  setMode(mode: PlaybackMode) {
    if (this.mode === "continuous" && mode !== "continuous" && this.snapshot.isNavigating) {
      ++this.revision;
      this.update({ isNavigating: false });
    }
    this.mode = mode;
    this.audio.loop = mode === "repeat";
    if (mode === "continuous") this.prepareNext();
  }

  setSpeed(speed: number) {
    this.speed = speed;
    this.audio.playbackRate = speed;
  }

  select(track: AudioTrack, autoplay = false) {
    const revision = ++this.revision;
    this.audio.src = track.audioSrc;
    this.audio.playbackRate = this.speed;
    this.update({ track, isNavigating: false, isPlaying: false, error: null });
    if (autoplay) this.play(revision);
    this.prepareNext();
  }

  play(revision = this.revision) {
    // Feature-detected: Safari can use this declaration for media playback.
    if (typeof navigator !== "undefined" && "audioSession" in navigator) {
      try {
        (navigator as Navigator & { audioSession: { type: string } }).audioSession.type = "playback";
      } catch { /* Optional API; native media playback remains available. */ }
    }
    if (this.audio.error) this.audio.load();
    void this.audio.play().catch(() => {
      if (revision !== this.revision) return;
      this.update({
        isPlaying: false,
        error: "Playback stopped. Press play to continue.",
      });
    });
  }

  pause() {
    ++this.revision; // Cancel a pending skip or a late play rejection.
    this.audio.pause();
    this.update({ isNavigating: false, isPlaying: false });
  }

  close() {
    this.pause();
    this.audio.removeAttribute("src");
    this.audio.load();
    this.cache.clear();
    this.update({ track: null, error: null });
  }

  private fetchChapter(reference: string) {
    let request = this.pending.get(reference);
    if (!request) {
      request = this.loadChapter(reference).then((track) => {
        this.cache.set(reference, track);
        // Metadata only, bounded to the most recently prepared chapters.
        if (this.cache.size > 6) this.cache.delete(this.cache.keys().next().value!);
        return track;
      }).finally(() => this.pending.delete(reference));
      this.pending.set(reference, request);
    }
    return request;
  }

  private prepareNext() {
    const next = this.snapshot.track?.nextChapter;
    if (this.mode !== "continuous" || !next || this.cache.has(next)) return;
    // A failed prefetch is retried by goToChapter; do not interrupt this chapter.
    void this.fetchChapter(next).catch(() => {});
  }

  goToChapter(reference: string | null) {
    if (!reference) return;
    const ready = this.cache.get(reference);
    if (ready) {
      this.select(ready, true);
      return;
    }
    const revision = ++this.revision;
    this.update({ isNavigating: true, error: null });
    void this.fetchChapter(reference).then((track) => {
      if (revision === this.revision) this.select(track, true);
    }).catch(() => {
      if (revision !== this.revision) return;
      this.update({
        isNavigating: false,
        error: "Could not load the next chapter. Check your connection and try the chapter button again.",
      });
    });
  }

  dispose() {
    ++this.revision;
    this.audio.removeEventListener("ended", this.onEnded);
    this.audio.removeEventListener("playing", this.onPlaying);
    this.audio.removeEventListener("pause", this.onPause);
    this.audio.removeEventListener("error", this.onError);
    this.audio.pause();
  }
}
