import { VirtualTime } from './virtualTime';

/** 动画 */
interface Animation {
  /** key 非空的动画，同一个动画不会被重复添加 */
  key: string | null;
  /** 动画长度 ms */
  length: number;
  /**
   * 绘制函数
   * @param t 当前时刻，从0开始
   * @returns
   */
  draw: (t: number) => void;
  /** 当前时刻，从0开始 */
  currrentTick: number;
  /** 开始的时间 */
  startTime: number;
  /** 结束後做的事情，可以由此做出动画链 */
  onFinish?: ((params?: any | null) => void) | null;
}

export default class AnimationUtils {
  constructor(virtualTime: VirtualTime = new VirtualTime()) {
    this.initAnimations(virtualTime);
  }

  /** 显示的动画列表 */
  animationList: Animation[] = [];

  animationVirtualTime: VirtualTime | undefined = undefined;
  animationTimeoutAbortController: AbortController | undefined = undefined;
  initAnimations = (virtualTime: VirtualTime) => {
    this.animationVirtualTime = virtualTime;
    this.animationTimeoutAbortController = new AbortController();
    // 拖动进度条後，清除所有动画
    this.animationVirtualTime.onSeek((_: number) => {
      // 清除已进入列表的动画
      this.animationList.splice(0, this.animationList.length);
      // 清除还在等待的动画
      this.animationTimeoutAbortController?.abort();
      this.animationTimeoutAbortController = new AbortController();
    });
  };

  /** 绘制所有动画 */
  drawAnimations = () => {
    if (this.animationList.length > 0) {
      //console.log(animationList);
      for (let i = 0; i < this.animationList.length; i++) {
        const currentAnimation = this.animationList[i];
        // 绘制
        currentAnimation.draw(currentAnimation.currrentTick);
        // 更新时刻
        currentAnimation.currrentTick = this.animationVirtualTime!.read() - currentAnimation.startTime;
        if (currentAnimation.currrentTick > currentAnimation.length && currentAnimation.onFinish) {
          currentAnimation.onFinish();
        }
      }

      // 清理过期动画
      this.animationList = this.animationList.filter(a => {
        return a.currrentTick <= a.length;
      });
    }
  };

  /**
   * 播放一段动画
   * @param length 动画持续时间 ms
   * @param draw 动画绘制函数
   * @param wait 播放延迟，必须大于等于0，默认为0
   */
  animation = (key: string | null, length: number, draw: (t: number) => void, wait: number = 0, onFinish?: (params?: any | null) => void) => {
    const fun = () => {
      const existing = key === null ? null : this.animationList.find(a => a.key === key);
      if (existing) {
        // 不重复加入同一个动画
      } else {
        this.animationList.push({ key, length, draw, currrentTick: 0, startTime: this.animationVirtualTime!.read(), onFinish });
      }
    };

    if (wait > 0) {
      const timeout = setTimeout(fun, wait);
      this.animationTimeoutAbortController!.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
      });
    } else {
      fun();
    }
  };
}
