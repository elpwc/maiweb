import { ChartErrorType } from './types/chartErrorType';

/** 一个谱面错误 */
export interface ChartError {
  /** 错误类型 */
  errorType: ChartErrorType;
  /** 错误行 */
  row: number;
  /** 错误列 */
  col: number;
}
