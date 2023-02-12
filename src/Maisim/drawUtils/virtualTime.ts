export class VirtualTime {
    duration: number = Infinity;
    advance: number = 0;
    start: number = 0; // realTime
    paused: boolean = false;
    pausedTotal: number = 0;
    lastPause: number = 0; // realTime
    seekDelta: number = 0.0; // [0,1]
    speedFactor: number = 1.0; // [0,1]
    previousSpeedFactor: number = 1.0; // [0,1]
    lastSpeedFactorChange: number = 0; // playingTime
    initialized: boolean = false;
    eventTarget: EventTarget = new EventTarget();
    /**
     * 载入谱面时初始化 
     * @param duration [提前时间 + 音乐长度] (ms)
     * @param advance [提前时间] (ms)
     */
    init(duration: number, advance: number): void {
        let realTime = VirtualTime.getRealTime();
        this.duration = duration;
        this.advance = advance;
        this.start = realTime;
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
    /**
     * 获取绘制图形所需的当前时间
     */
    read(): number {
        if (!(this.initialized)) { throw Error('invalid operation') }
        let realTime = this.getInstanceRealTime();
        if (!(this.paused)) {
            this.notifyProgress(realTime, 'read');
        }
        return ((this.computeProgress(realTime) * this.duration) - this.advance);
    }
    /**
     * 指定进度到一个特定位置（拖动进度条）
     * @param targetProgress [0,1]
     */
    seek(targetProgress: number): void {
        if (!(this.initialized)) { throw Error('invalid operation') }
        let realTime = this.getInstanceRealTime();
        let currentProgress = this.computeProgress(realTime);
        this.seekDelta = (this.seekDelta + targetProgress - currentProgress);
        this.notifyProgress(realTime, 'seek');
    }
    /**
     * 改变相对速度
     * @param speedFactor [0,1]
     */
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
    // ----------------------------------------------------
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
    /**
     * 进度指定（拖动进度条） 事件
     */
    onSeek(callback: (progress: number) => void): () => void {
        return this.onProgress((progress: number, kind: string) => {
            if (kind == 'seek') {
                callback(progress);
            }
        });
    }
    /**
     * 进度更新 事件
     */
    onProgress(callback: (progress: number, kind: string) => void): () => void {
        return this.recvEvent('progress', ({progress,kind}) => callback(progress,kind));
    }
    notifyProgress(realTime: number, kind: string) {
        let progress = this.computeProgress(realTime);
        this.sendEvent('progress', {progress, kind});
    }
    /**
     * 相对速度改变 事件
     */
    onSpeedFactorChange(callback: (speedFactor: number) => void): () => void {
        return this.recvEvent('speedfactorchange', callback);
    }
    notifySpeedFactorChange(speedFactor: number): void {
        this.sendEvent('speedfactorchange', speedFactor);
    }
    /**
     * 暂停
     */
    pause(): void {
        if (!(this.paused)) {
            let realTime = VirtualTime.getRealTime();
            this.lastPause = realTime;
            this.paused = true;
            this.notifyPlayPause();
        }
    }
    /**
     * 取消暂停
     */
    resume(): void {
        if (this.paused) {
            let realTime = VirtualTime.getRealTime();
            this.pausedTotal = (this.pausedTotal + (realTime - this.lastPause));
            this.paused = false;
            this.notifyPlayPause();
        }
    }
    /**
     * 播放/暂停 事件
     */
    onPlayPause(callback: (paused: boolean) => void): () => void {
        return this.recvEvent('playpause', callback);
    }
    notifyPlayPause(): void {
        this.sendEvent('playpause', this.paused);
    }
    // ----------------------------------------------------
    static getRealTime(): number {
        return performance.now();
    }
    getInstanceRealTime(): number {
        return (this.paused)? this.lastPause: VirtualTime.getRealTime();
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


