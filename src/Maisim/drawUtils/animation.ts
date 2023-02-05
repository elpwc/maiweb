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

/** 显示的动画列表 */
export let animationList: Animation[] = [];

/** 绘制所有动画 */
export const drawAnimations = (pausedTotalTime: number) => {
  if (animationList.length > 0) {
    //console.log(animationList);
    for (let i = 0; i < animationList.length; i++) {
      const currentAnimation = animationList[i];
      // 绘制
      currentAnimation.draw(currentAnimation.currrentTick);
      // 更新时刻
      currentAnimation.currrentTick = performance.now() - pausedTotalTime - currentAnimation.startTime;
      if (currentAnimation.currrentTick > currentAnimation.length && currentAnimation.onFinish) {
        currentAnimation.onFinish();
      }
    }

    // 清理过期动画
    animationList = animationList.filter(a => {
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
export const animation = (key: string | null, pausedTotalTime: number, length: number, draw: (t: number) => void, wait: number = 0, onFinish?: (params?: any | null) => void) => {
  const fun = () => {
    const existing = key === null ? null : animationList.find(a => a.key === key);
    if (existing) {
      // 不重复加入同一个动画
    } else {
      animationList.push({ key, length, draw, currrentTick: 0, startTime: performance.now() - pausedTotalTime, onFinish });
    }
  };

  if (wait > 0) {
    setTimeout(fun, wait);
  } else {
    fun();
  }
};
