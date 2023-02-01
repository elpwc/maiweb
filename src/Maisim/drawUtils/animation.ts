/** 动画 */
interface Animation {
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
}

/** 显示的动画列表 */
export let animationList: Animation[] = [];

/** 绘制所有动画 */
export const drawAnimations = () => {
  if (animationList.length > 0) {
    //console.log(animationList);
    for (let i = 0; i < animationList.length; i++) {
      const currentAnimation = animationList[i];
      // 绘制
      currentAnimation.draw(currentAnimation.currrentTick);
      // 更新时刻
      currentAnimation.currrentTick = performance.now() - currentAnimation.startTime;
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
export const animation = (length: number, draw: (t: number) => void, wait: number = 0) => {
  const fun = () => {
    animationList.push({ length, draw, currrentTick: 0, startTime: performance.now() });
  };

  if (wait > 0) {
    setTimeout(fun, wait);
  } else {
    fun();
  }
};
