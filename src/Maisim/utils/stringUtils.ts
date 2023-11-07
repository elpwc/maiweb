/**
 * 在一个字符串内搜索子串所有位置
 * @param str
 * @param s
 * @returns
 */
export const findAllStr = (str: string, s: string): number[] => {
  let i = 0;
  const res = [];
  while (i <= str.length - s.length) {
    const pos = str.indexOf(s, i);
    if (pos > -1) {
      res.push(pos);
      i = pos + 1;
    } else {
      i++;
    }
  }
  return res;
};

/**
 * 在字符串内指定区间替换
 * @param str
 * @param oriStr
 * @param targetStr
 * @param start
 * @param end
 * @returns
 */
export const replaceAt = (str: string, oriStr: string, targetStr: string, start: number, end: number): string => {
  const s = str.substring(start, end).replaceAll(oriStr, targetStr);
  return str.substring(0, start) + s + str.substring(end, str.length);
};

/**
 * 在字符串内指定的两个字符串之间替换
 * @param str 原始字符串
 * @param oriStr 被替换字符
 * @param targetStr 替换到的字符
 * @param startStr 起始字符
 * @param endStr 结束字符
 * @returns
 */
export const replaceFromStrToStr = (str: string, oriStr: string, targetStr: string, startStr: string, endStr: string): string => {
  const start = str.indexOf(startStr),
    end = str.indexOf(endStr, start),
    s = str.substring(start, end).replaceAll(oriStr, targetStr);
  return str.substring(0, start) + s + str.substring(end, str.length);
};
