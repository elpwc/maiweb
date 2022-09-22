/** SLIDE TRACK分段 */
export const section = (type: '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' | undefined, startPos: string, endPosOri: string, turnPosOri?: string) => {
  let endPos = Number(endPosOri) - Number(startPos) + 1;
  let turnPos = (Number(turnPosOri) ?? 0) - Number(startPos) + 1;
  if (endPos < 1) endPos += 8;
  if (turnPos < 1) turnPos += 8;

  return section_A1(type, endPos, turnPos)?.map((section) => {
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
export const section_A1 = (type: '-' | '^' | '<' | '>' | 'v' | 'p' | 'q' | 's' | 'z' | 'pp' | 'qq' | 'w' | 'V' | undefined, endPos: number, turnPos?: number) => {
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
      break;
    case '<':
      break;
    case '>':
      break;
    case 'v':
      break;
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
