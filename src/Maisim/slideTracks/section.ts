/** SLIDE TRACK分段 */
export const section = (type: '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' | undefined, startPos: string, endPosOri: string, turnPosOri?: string) => {
  let endPos = Number(endPosOri) - Number(startPos) + 1;
  let turnPos = (Number(turnPosOri) ?? 0) - Number(startPos) + 1;
  if (endPos < 1) endPos += 8;
  if (turnPos < 1) turnPos += 8;

  return section_A1(type, endPos, turnPos, Number(startPos))?.map((section) => {
    const resAreas = section.areas.map((area) => {
      if (area !== 'C') {
        let newPos = Number(area.substring(1, 2)) + Number(startPos) - 1;
        if (newPos > 8) newPos -= 8;
        return area.substring(0, 1) + newPos.toString();
      } else return 'C';
    });
    return { start: section.start, areas: resAreas };
  });
};

/** SLIDE TRACK分段(适用于A1) */
export const section_A1 = (type: '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' | undefined, endPos: number, turnPos: number, startPos: number) => {
  switch (type) {
    case '-':
      switch (endPos) {
        case 3:
          return [
            { start: 0, areas: ['A1', 'D2', 'E2'] },
            { start: 0.35, areas: ['A2', 'B2'] },
            { start: 0.65, areas: ['A3', 'D3', 'E3'] },
          ];
        case 4:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.2, areas: ['E2', 'B2'] },
            { start: 0.5, areas: ['B3'] },
            { start: 0.7, areas: ['A4', 'E4'] },
          ];
        case 5:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.17964, areas: ['B1'] },
            { start: 0.34132, areas: ['C'] },
            { start: 0.62874, areas: ['B5'] },
            { start: 0.80838, areas: ['A5'] },
          ];
        case 6:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.2, areas: ['E1', 'B8'] },
            { start: 0.5, areas: ['B7'] },
            { start: 0.7, areas: ['A6', 'E7'] },
          ];
        case 7:
          return [
            { start: 0, areas: ['A1', 'D1', 'E1'] },
            { start: 0.35, areas: ['A8', 'B8'] },
            { start: 0.65, areas: ['A7', 'D8', 'E8'] },
          ];
      }
      break;
    case '^':
      const res = [];
      if (endPos > 1 && endPos < 5) {
        const points = [0, 0.104167, 0.416667, 0.729167, 1];
        const areas = [['A1'], ['D2', 'A2'], ['D3', 'A3'], ['D4', 'A4']];
        for (let i = 0; i < endPos; i++) {
          res.push({ start: points[i] / ((endPos - 1) / 3), areas: areas[i] });
        }
      } else if (endPos > 5 && endPos <= 8) {
        const points = [0, 0.104167, 0.4375, 0.770833, 1];
        const areas = [['A1'], ['D1', 'A8'], ['D8', 'A7'], ['D7', 'A6']];
        for (let i = 0; i < endPos - 4; i++) {
          res.push({ start: points[i] / ((9 - endPos) / 3), areas: areas[i] });
        }
      }
      return res;
    case '<':
      const res2 = [];
      if (startPos <= 2 || startPos >= 7) {
        const points = [0, 0.0390625, 0.1640625, 0.2890625, 0.4140625, 0.5390625, 0.6640625, 0.7890625, 0.9140625, 1];
        const areas = [['A1'], ['D1', 'A8'], ['D8', 'A7'], ['D7', 'A6'], ['D6', 'A5'], ['D5', 'A4'], ['D4', 'A3'], ['D3', 'A2'], ['D2', 'A1']];

        if (endPos > 1) {
          for (let i = 0; i < 10 - endPos; i++) {
            res2.push({ start: points[i] / ((9 - endPos) / 8), areas: areas[i] });
          }
        } else if (endPos === 1) {
          for (let i = 0; i < 9; i++) {
            res2.push({ start: points[i] / 1, areas: areas[i] });
          }
        }
      } else if (startPos >= 3 && startPos <= 6) {
        const points = [0, 0.0390625, 0.1640625, 0.2890625, 0.4140625, 0.5390625, 0.6640625, 0.7890625, 0.9140625, 1];
        const areas = [['A1'], ['D2', 'A2'], ['D3', 'A3'], ['D4', 'A4'], ['D5', 'A5'], ['D6', 'A6'], ['D7', 'A7'], ['D8', 'A8'], ['D1', 'A1']];

        for (let i = 0; i < endPos; i++) {
          res2.push({ start: points[i] / ((endPos - 1) / 8), areas: areas[i] });
        }
      } else {
      }
      return res2;
    case '>':
      const res3 = [];
      if (startPos <= 2 || startPos >= 7) {
        const points = [0, 0.0390625, 0.1640625, 0.2890625, 0.4140625, 0.5390625, 0.6640625, 0.7890625, 0.9140625, 1];
        const areas = [['A1'], ['D2', 'A2'], ['D3', 'A3'], ['D4', 'A4'], ['D5', 'A5'], ['D6', 'A6'], ['D7', 'A7'], ['D8', 'A8'], ['D1', 'A1']];

        if (endPos > 1) {
          for (let i = 0; i < endPos; i++) {
            res3.push({ start: points[i] / ((endPos - 1) / 8), areas: areas[i] });
          }
        } else if (endPos === 1) {
          for (let i = 0; i < 9; i++) {
            res3.push({ start: points[i] / 1, areas: areas[i] });
          }
        }
      } else if (startPos >= 3 && startPos <= 6) {
        const points = [0, 0.0390625, 0.1640625, 0.2890625, 0.4140625, 0.5390625, 0.6640625, 0.7890625, 0.9140625, 1];
        const areas = [['A1'], ['D1', 'A8'], ['D8', 'A7'], ['D7', 'A6'], ['D6', 'A5'], ['D5', 'A4'], ['D4', 'A3'], ['D3', 'A2'], ['D2', 'A1']];

        for (let i = 0; i < 10 - endPos; i++) {
          res3.push({ start: points[i] / ((9 - endPos) / 8), areas: areas[i] });
        }
      } else {
      }
      return res3;
    case 'v':
      return [
        { start: 0, areas: ['A1'] },
        { start: 0.17964, areas: ['B1'] },
        { start: 0.34132, areas: ['C'] },
        { start: 0.62874, areas: ['B' + endPos] },
        { start: 0.80838, areas: ['A' + endPos] },
      ];
    case 'p':
      break;
    case 'q':
      break;
    case 'pp':
      break;
    case 'qq':
      break;
    case 's':
      break;
    case 'z':
      break;
    case 'V':
      break;
    case 'w':
      break;
    default:
      break;
  }
};
