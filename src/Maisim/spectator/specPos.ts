import MaimaiValues from '../maimaiValues';
import { cos, sin } from '../utils/math';
import { SpecPosType } from './specPosType';

/** 观赏谱的点 */
export class SpecPos {
  constructor(a: number = 0, b: number = 0, type: SpecPosType = SpecPosType.Cartesian) {
    this.x_sita = a;
    this.y_r = b;
    this.type = type;
  }

  x_sita: number = 0;
  y_r: number = 0;

  type: SpecPosType = SpecPosType.Cartesian;

  getCoord(values: MaimaiValues) {
    switch (this.type) {
      case SpecPosType.Cartesian:
        return [values.center[0] + (this.x_sita / 100) * values.maimaiScreenR, values.center[1] - (this.y_r / 100) * values.maimaiScreenR];
      case SpecPosType.Polar:
        const θ = ((this.x_sita - 90) / 180) * Math.PI;
        return [values.center[0] + (this.y_r / 100) * values.maimaiScreenR * cos(θ), values.center[1] + (this.y_r / 100) * values.maimaiScreenR * sin(θ)];
      default:
        return [0, 0];
    }
  }

  /** 将这个SpecPos转换为string形式 */
  toString() {
    let _type = '';
    switch (this.type) {
      case SpecPosType.Cartesian:
        _type = '#';
        break;
      case SpecPosType.Polar:
        _type = '@';
        break;
    }
    return `${_type}(${this.x_sita}'${this.y_r})`;
  }

  /** 从谱面中读取出SpecPos */
  static readPosFromStr(str: string) {
    const firstChar = str.substring(0, 1);
    const res = new SpecPos();
    switch (firstChar) {
      case '#':
        res.type = SpecPosType.Cartesian;
        break;
      case '@':
        res.type = SpecPosType.Polar;
        break;
      default:
        break;
    }
    const coords = str.split("'");

    let num1 = coords[0].substring(2, coords[0].length);
    let num2 = coords[1].substring(0, coords[1].length - 1);

    if (num1 === '~') {
      num1 = '-1';
    }
    if (num2 === '~') {
      num2 = '-1';
    }

    res.x_sita = Number(num1);
    res.y_r = Number(num2);

    return res;
  }
}
