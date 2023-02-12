export class VirtualTime {
    duration: number = Infinity;
    start: number = 0; // realTime
    paused: boolean = false;
    pausedTotal: number = 0; // realTime
    lastPause: number = 0; // realTime
    seekDelta: number = 0.0; // [0,1]
    speedFactor: number = 1.0; // [0,1]
    previousSpeedFactor: number = 1.0; // [0,1]
    lastSpeedFactorChange: number = 0; // playingTime
    initialized: boolean = false;
    eventTarget: EventTarget = new EventTarget();
    init(duration: number, advance: number): void {
        let realTime = VirtualTime.getRealTime();
        this.duration = duration;
        this.start = (realTime - advance);
        this.paused = false;
        this.pausedTotal = 0;
        this.lastPause = 0;
        this.seekDelta = 0.0
        this.speedFactor = 1.0;
        this.previousSpeedFactor = 1.0;
        this.lastSpeedFactorChange = 0;
        this.initialized = true;
        this.notifyProgress(realTime, 'init');
        this.notifyPlayPause();
    }
    read(): number {
        if (!(this.initialized)) { throw Error('invalid operation') }
        let realTime = this.getInstanceRealTime();
        if (!(this.paused)) {
            this.notifyProgress(realTime, 'read');
        }
        return (this.computeProgress(realTime) * this.duration);
    }
    seek(targetProgress: number): void {
        if (!(this.initialized)) { throw Error('invalid operation') }
        let realTime = this.getInstanceRealTime();
        let currentProgress = this.computeProgress(realTime);
        this.seekDelta = (this.seekDelta + targetProgress - currentProgress);
        this.notifyProgress(realTime, 'seek');
    }
    setSpeedFactor(speedFactor: number): void {
        if (speedFactor == this.speedFactor) {
            return;
        }
        if (!(this.initialized)) {
            this.speedFactor = speedFactor;
            this.notifySpeedFactorChange(speedFactor);
            return;
        }
        let realTime = this.getInstanceRealTime();
        let playingTime = this.computePlayingTime(realTime);
        let scaledPlayingTime = this.computeScaledPlayingTime(realTime);
        this.previousSpeedFactor = (scaledPlayingTime / playingTime);
        this.lastSpeedFactorChange = playingTime;
        this.speedFactor = speedFactor;
        this.notifySpeedFactorChange(speedFactor);
    }
    static getRealTime(): number {
        return performance.now();
    }
    getInstanceRealTime(): number {
        return (this.paused)? this.lastPause: VirtualTime.getRealTime();
    }
    computePlayingTime(realTime: number): number {
        return (realTime - this.start - this.pausedTotal);
    }
    computeScaledPlayingTime(realTime: number): number {
        let a = (this.computePlayingTime(realTime) - this.lastSpeedFactorChange);
        let b = this.lastSpeedFactorChange;
        return ((a * this.speedFactor) + (b * this.previousSpeedFactor));
    }
    computeProgress(realTime: number): number {
        return ((this.computeScaledPlayingTime(realTime) / this.duration) + this.seekDelta);
    }
    notifyProgress(realTime: number, kind: string) {
        let progress = this.computeProgress(realTime);
        this.sendEvent('progress', {progress, kind});
    }
    onProgress(callback: (progress: number, kind: string) => void): () => void {
        return this.recvEvent('progress', ({progress,kind}) => callback(progress,kind));
    }
    onSeek(callback: (progress: number) => void): () => void {
        return this.onProgress((progress: number, kind: string) => {
            if (kind == 'seek') {
                callback(progress);
            }
        });
    }
    notifySpeedFactorChange(speedFactor: number): void {
        this.sendEvent('speedfactorchange', speedFactor);
    }
    onSpeedFactorChange(callback: (speedFactor: number) => void): () => void {
        return this.recvEvent('speedfactorchange', callback);
    }
    pause(): void {
        if (!(this.paused)) {
            let realTime = VirtualTime.getRealTime();
            this.lastPause = realTime;
            this.paused = true;
            this.notifyPlayPause();
        }
    }
    resume(): void {
        if (this.paused) {
            let realTime = VirtualTime.getRealTime();
            this.pausedTotal = (this.pausedTotal + (realTime - this.lastPause));
            this.paused = false;
            this.notifyPlayPause();
        }
    }
    notifyPlayPause(): void {
        this.sendEvent('playpause', this.paused);
    }
    onPlayPause(callback: (paused: boolean) => void): () => void {
        return this.recvEvent('playpause', callback);
    }
    sendEvent(name: string, detail: any): void {
        this.eventTarget.dispatchEvent(new CustomEvent(name, { detail }));
    }
    recvEvent(name: string, callback: (detail: any) => void): () => void {
        let l = (ev: Event) => callback((ev as CustomEvent).detail);
        this.eventTarget.addEventListener(name, l);
        return () => { this.eventTarget.removeEventListener(name, l); }
    }
}


