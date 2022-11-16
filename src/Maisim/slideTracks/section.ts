import { trackLength } from './_global';

/** SLIDE TRACK分段 */
export const section = (
  type: string | undefined,
  startPos: string,
  endPosOri: string,
  turnPosOri?: string
): { start: number; areas: string[] }[] | undefined => {
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

/** SLIDE TRACK分段(仅适用于A1开头的SLIDE TRACK) */
const section_A1 = (
  type: string | undefined,
  endPos: number,
  turnPos: number,
  startPos: number
): { start: number; areas: string[] }[] | undefined => {
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
      switch (endPos) {
        case 1:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.10482679161531808, areas: ['E1', 'B8'] },
            { start: 0.2695546070108179, areas: ['B7', 'B6'] },
            { start: 0.4539109214021636, areas: ['B5'] },
            { start: 0.5460890785978364, areas: ['B4', 'B3'] },
            { start: 0.7753711608243185, areas: ['B2', 'E2'] },
            { start: 0.8951732083846818, areas: ['A1'] },
          ];
        case 2:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.11547066469727205, areas: ['E1', 'B8'] },
            { start: 0.26393294787947896, areas: ['B7'] },
            { start: 0.3984622831822069, areas: ['B6'] },
            { start: 0.5, areas: ['B5'] },
            { start: 0.6015377168177931, areas: ['B4'] },
            { start: 0.7030754336355862, areas: ['B3'] },
            { start: 0.8185460983328582, areas: ['E3', 'A2'] },
          ];
        case 3:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.12852032506951075, areas: ['E1', 'B8'] },
            { start: 0.3304808358930276, areas: ['B7'] },
            { start: 0.44349361196434256, areas: ['B6'] },
            { start: 0.5565063880356574, areas: ['B5'] },
            { start: 0.6695191641069724, areas: ['B4'] },
            { start: 0.7796794427379816, areas: ['E4'] },
            { start: 0.8714796749304892, areas: ['A3'] },
          ];
        case 4:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.14489535091640052, areas: ['E1', 'B8'] },
            { start: 0.3725880452136013, areas: ['B7'] },
            { start: 0.5, areas: ['B6'] },
            { start: 0.6274119547863987, areas: ['B5'] },
            { start: 0.7516079698575991, areas: ['E5'] },
            { start: 0.8551046490835994, areas: ['A4'] },
          ];
        case 5:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.16605241351998068, areas: ['E1', 'B8'] },
            { start: 0.42699192047995027, areas: ['B7'] },
            { start: 0.5730080795200497, areas: ['B6'] },
            { start: 0.7153387196800332, areas: ['E6'] },
            { start: 0.8339475864800193, areas: ['A5'] },
          ];
        case 6:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.08211826154995631, areas: ['E1', 'B8'] },
            { start: 0.21116124398560196, areas: ['B7'] },
            { start: 0.2893903326645415, areas: ['B6'] },
            { start: 0.3676194213434811, areas: ['B5'] },
            { start: 0.4458485100224207, areas: ['B4'] },
            { start: 0.5240775987013602, areas: ['B3'] },
            { start: 0.6023066873802998, areas: ['B2'] },
            { start: 0.6805357760592394, areas: ['B8', 'B1'] },
            { start: 0.788838756014398, areas: ['B7'] },
            { start: 0.859225837342932, areas: ['E7'] },
            { start: 0.9225742105386127, areas: ['A6'] },
          ];

        case 7:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.08850950540943395, areas: ['E1', 'B8'] },
            { start: 0.22759587105283016, areas: ['B7'] },
            { start: 0.3119135102346033, areas: ['B6'] },
            { start: 0.3962311494163764, areas: ['B5'] },
            { start: 0.4805487885981496, areas: ['B4'] },
            { start: 0.5648664277799226, areas: ['B3'] },
            { start: 0.6491840669616958, areas: ['B2'] },
            { start: 0.733501706143469, areas: ['B8', 'B1'] },
            { start: 0.8482694192981133, areas: ['E8'] },
            { start: 0.9165481806139623, areas: ['A7'] },
          ];
        case 8:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.09597957157875799, areas: ['E1', 'B8'] },
            { start: 0.24680461263109194, areas: ['B7'] },
            { start: 0.3312030750873946, areas: ['B6'] },
            { start: 0.41560153754369733, areas: ['B5'] },
            { start: 0.5, areas: ['B4'] },
            { start: 0.5843984624563027, areas: ['B3'] },
            { start: 0.6687969249126053, areas: ['B2'] },
            { start: 0.753195387368908, areas: ['B1'] },
            { start: 0.849174958947666, areas: ['A8', 'E1'] },
          ];
        default:
          return [];
      }
    case 'q':
      switch (endPos) {
        case 1:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.10482679161531808, areas: ['E2', 'B2'] },
            { start: 0.2695546070108179, areas: ['B3', 'B4'] },
            { start: 0.4539109214021636, areas: ['B5'] },
            { start: 0.5460890785978364, areas: ['B6', 'B7'] },
            { start: 0.7753711608243185, areas: ['B8', 'E1'] },
            { start: 0.8951732083846818, areas: ['A1'] },
          ];
        case 8:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.11547066469727205, areas: ['E2', 'B2'] },
            { start: 0.26393294787947896, areas: ['B3'] },
            { start: 0.3984622831822069, areas: ['B4'] },
            { start: 0.5, areas: ['B5'] },
            { start: 0.6015377168177931, areas: ['B6'] },
            { start: 0.7030754336355862, areas: ['B7'] },
            { start: 0.8185460983328582, areas: ['E8', 'A8'] },
          ];
        case 7:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.12852032506951075, areas: ['E2', 'B2'] },
            { start: 0.3304808358930276, areas: ['B3'] },
            { start: 0.44349361196434256, areas: ['B4'] },
            { start: 0.5565063880356574, areas: ['B5'] },
            { start: 0.6695191641069724, areas: ['B6'] },
            { start: 0.7796794427379816, areas: ['E7'] },
            { start: 0.8714796749304892, areas: ['A7'] },
          ];
        case 6:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.14489535091640052, areas: ['E2', 'B2'] },
            { start: 0.3725880452136013, areas: ['B3'] },
            { start: 0.5, areas: ['B4'] },
            { start: 0.6274119547863987, areas: ['B5'] },
            { start: 0.7516079698575991, areas: ['E6'] },
            { start: 0.8551046490835994, areas: ['A6'] },
          ];
        case 5:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.16605241351998068, areas: ['E2', 'B2'] },
            { start: 0.42699192047995027, areas: ['B3'] },
            { start: 0.5730080795200497, areas: ['B4'] },
            { start: 0.7153387196800332, areas: ['E5'] },
            { start: 0.8339475864800193, areas: ['A5'] },
          ];
        case 4:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.08211826154995631, areas: ['E2', 'B2'] },
            { start: 0.21116124398560196, areas: ['B3'] },
            { start: 0.2893903326645415, areas: ['B4'] },
            { start: 0.3676194213434811, areas: ['B5'] },
            { start: 0.4458485100224207, areas: ['B6'] },
            { start: 0.5240775987013602, areas: ['B7'] },
            { start: 0.6023066873802998, areas: ['B8'] },
            { start: 0.6805357760592394, areas: ['B1', 'B2'] },
            { start: 0.788838756014398, areas: ['B3'] },
            { start: 0.859225837342932, areas: ['E4'] },
            { start: 0.9225742105386127, areas: ['A4'] },
          ];

        case 3:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.08850950540943395, areas: ['E2', 'B2'] },
            { start: 0.22759587105283016, areas: ['B3'] },
            { start: 0.3119135102346033, areas: ['B4'] },
            { start: 0.3962311494163764, areas: ['B5'] },
            { start: 0.4805487885981496, areas: ['B6'] },
            { start: 0.5648664277799226, areas: ['B7', 'B8'] },
            { start: 0.6491840669616958, areas: ['B1'] },
            { start: 0.733501706143469, areas: ['B2'] },
            { start: 0.8482694192981133, areas: ['E3'] },
            { start: 0.9165481806139623, areas: ['A3'] },
          ];
        case 2:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.09597957157875799, areas: ['E2', 'B2'] },
            { start: 0.24680461263109194, areas: ['B3'] },
            { start: 0.3312030750873946, areas: ['B4'] },
            { start: 0.41560153754369733, areas: ['B5'] },
            { start: 0.5, areas: ['B6'] },
            { start: 0.5843984624563027, areas: ['B7'] },
            { start: 0.6687969249126053, areas: ['B8'] },
            { start: 0.753195387368908, areas: ['B1'] },
            { start: 0.849174958947666, areas: ['A2', 'E2'] },
          ];
        default:
          return [];
      }
    case 'pp':
      switch (endPos) {
        case 1:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.1, areas: ['B1'] },
            { start: 0.2, areas: ['C'] },
            { start: 0.36, areas: ['B4', 'E4'] },
            { start: 0.51, areas: ['A3', 'D3'] },
            { start: 0.75, areas: ['A2'] },
            { start: 0.87, areas: ['D2', 'A1'] },
          ];
        case 2:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.12, areas: ['B1'] },
            { start: 0.25, areas: ['C'] },
            { start: 0.48, areas: ['B4', 'E4'] },
            { start: 0.65, areas: ['A3'] },
            { start: 0.83, areas: ['A2', 'D3'] },
          ];
        case 3:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.17, areas: ['B1'] },
            { start: 0.31, areas: ['C'] },
            { start: 0.55, areas: ['B4', 'E4'] },
            { start: 0.78, areas: ['A3'] },
          ];
        case 4:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.07, areas: ['B1'] },
            { start: 0.14, areas: ['C'] },
            { start: 0.25, areas: ['B4', 'E4'] },
            { start: 0.35, areas: ['A3', 'D3'] },
            { start: 0.52, areas: ['A2'] },
            { start: 0.6, areas: ['E2', 'B1'] },
            { start: 0.7, areas: ['C'] },
            { start: 0.85, areas: ['B4'] },
            { start: 0.92, areas: ['A4'] },
          ];
        case 5:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.08, areas: ['B1'] },
            { start: 0.15, areas: ['C'] },
            { start: 0.26, areas: ['B4', 'E4'] },
            { start: 0.36, areas: ['A3', 'D3'] },
            { start: 0.52, areas: ['A2'] },
            { start: 0.6, areas: ['E2', 'B1'] },
            { start: 0.7, areas: ['C'] },
            { start: 0.85, areas: ['B5'] },
            { start: 0.92, areas: ['A5'] },
          ];
        case 6:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.09, areas: ['B1'] },
            { start: 0.15, areas: ['C'] },
            { start: 0.28, areas: ['B4', 'E4'] },
            { start: 0.38, areas: ['A3', 'D3'] },
            { start: 0.53, areas: ['A2'] },
            { start: 0.61, areas: ['E2', 'B1'] },
            { start: 0.7, areas: ['C', 'B8'] },
            { start: 0.78, areas: ['B7'] },
            { start: 0.86, areas: ['A6', 'B6', 'E7'] },
          ];
        case 7:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.06, areas: ['B1'] },
            { start: 0.16, areas: ['C'] },
            { start: 0.31, areas: ['B4', 'E4'] },
            { start: 0.41, areas: ['A3', 'D3'] },
            { start: 0.56, areas: ['A2'] },
            { start: 0.69, areas: ['E2', 'B1'] },
            { start: 0.79, areas: ['E8', 'B8'] },
            { start: 0.92, areas: ['A7'] },
          ];
        case 8:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.07, areas: ['B1'] },
            { start: 0.17, areas: ['C'] },
            { start: 0.31, areas: ['B4', 'E4'] },
            { start: 0.43, areas: ['A3', 'D3'] },
            { start: 0.61, areas: ['A2'] },
            { start: 0.73, areas: ['E2', 'B1', 'A1'] },
            { start: 0.87, areas: ['E1', 'A8'] },
          ];
        default:
          return [];
      }
    case 'qq':
      switch (endPos) {
        case 1:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.1, areas: ['B1'] },
            { start: 0.2, areas: ['C'] },
            { start: 0.36, areas: ['B6', 'E7'] },
            { start: 0.51, areas: ['A7', 'D8'] },
            { start: 0.75, areas: ['A8'] },
            { start: 0.87, areas: ['D1', 'A1'] },
          ];
        case 8:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.12, areas: ['B1'] },
            { start: 0.25, areas: ['C'] },
            { start: 0.48, areas: ['B6', 'E7'] },
            { start: 0.65, areas: ['A7'] },
            { start: 0.83, areas: ['A8', 'D8'] },
          ];
        case 7:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.17, areas: ['B1'] },
            { start: 0.31, areas: ['C'] },
            { start: 0.55, areas: ['B6', 'E7'] },
            { start: 0.78, areas: ['A7'] },
          ];
        case 6:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.07, areas: ['B1'] },
            { start: 0.14, areas: ['C'] },
            { start: 0.25, areas: ['B6', 'E7'] },
            { start: 0.35, areas: ['A7', 'D8'] },
            { start: 0.52, areas: ['A8'] },
            { start: 0.6, areas: ['E1', 'B1'] },
            { start: 0.7, areas: ['C'] },
            { start: 0.85, areas: ['B6'] },
            { start: 0.92, areas: ['A6'] },
          ];
        case 5:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.08, areas: ['B1'] },
            { start: 0.15, areas: ['C'] },
            { start: 0.26, areas: ['B6', 'E7'] },
            { start: 0.36, areas: ['A7', 'D8'] },
            { start: 0.52, areas: ['A8'] },
            { start: 0.6, areas: ['E1', 'B1'] },
            { start: 0.7, areas: ['C'] },
            { start: 0.85, areas: ['B5'] },
            { start: 0.92, areas: ['A5'] },
          ];
        case 4:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.09, areas: ['B1'] },
            { start: 0.15, areas: ['C'] },
            { start: 0.28, areas: ['B6', 'E7'] },
            { start: 0.38, areas: ['A7', 'D8'] },
            { start: 0.53, areas: ['A8'] },
            { start: 0.61, areas: ['E1', 'B1'] },
            { start: 0.7, areas: ['C', 'B2'] },
            { start: 0.78, areas: ['B3'] },
            { start: 0.86, areas: ['A4', 'B4', 'E4'] },
          ];
        case 3:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.06, areas: ['B1'] },
            { start: 0.16, areas: ['C'] },
            { start: 0.31, areas: ['B6', 'E7'] },
            { start: 0.41, areas: ['A7', 'D8'] },
            { start: 0.56, areas: ['A8'] },
            { start: 0.69, areas: ['E1', 'B1'] },
            { start: 0.79, areas: ['E3', 'B2'] },
            { start: 0.92, areas: ['A3'] },
          ];
        case 2:
          return [
            { start: 0, areas: ['A1'] },
            { start: 0.07, areas: ['B1'] },
            { start: 0.17, areas: ['C'] },
            { start: 0.31, areas: ['B6', 'E7'] },
            { start: 0.43, areas: ['A7', 'D8'] },
            { start: 0.61, areas: ['A8'] },
            { start: 0.73, areas: ['E1', 'B1', 'A1'] },
            { start: 0.87, areas: ['E2', 'A2'] },
          ];
        default:
          return [];
      }
    case 's':
      return [
        { start: 0, areas: ['A1'] },
        { start: 0.118644, areas: ['B1', 'B8', 'E1'] },
        { start: 0.294915, areas: ['B7'] },
        { start: 0.420339, areas: ['C'] },
        { start: 0.586441, areas: ['B3'] },
        { start: 0.705085, areas: ['B4'] },
        { start: 0.827119, areas: ['E5', 'A5'] },
      ];
    case 'z':
      return [
        { start: 0, areas: ['A1'] },
        { start: 0.118644, areas: ['B1', 'B2', 'E2'] },
        { start: 0.294915, areas: ['B3'] },
        { start: 0.420339, areas: ['C'] },
        { start: 0.586441, areas: ['B7'] },
        { start: 0.705085, areas: ['B6'] },
        { start: 0.827119, areas: ['E6', 'A5'] },
      ];
    case 'V':
      const length1 = trackLength('-', 1, turnPos);
      const length2 = trackLength('-', turnPos, endPos);
      const part1: { start: number; areas: string[] }[] | undefined = section_A1('-', turnPos, 0, 0);
      const part2: { start: number; areas: string[] }[] | undefined = section('-', turnPos.toString(), endPos.toString());
      const resV = [];

      for (let i = 0; i < part1?.length! - 1; i++) {
        resV.push({ start: (part1![i].start * length1) / (length1 + length2), areas: part1![i].areas });
      }
      resV.push({
        start: (part1![part1?.length! - 1].start * length1) / (length1 + length2),
        areas: part2![0].areas.concat(part1![part1!.length! - 1].areas.filter((v) => !part2![0].areas.includes(v))),
      });
      for (let i = 1; i < part2?.length!; i++) {
        resV.push({ start: (part2![i].start * length2 + length1) / (length1 + length2), areas: part2![i].areas });
      }
      return resV;
    case 'w':
      break;
    default:
      break;
  }
};

export const section_wifi = (startPos: string, endPosOri: string): { start: number; areas: string[] }[][] => {
  let endPos = Number(endPosOri) - Number(startPos) + 1;
  if (endPos < 1) endPos += 8;

  const wifiSections = [
    [
      { start: 0, areas: ['A1'] },
      { start: 0.2, areas: ['E2', 'B2'] },
      { start: 0.5, areas: ['B3'] },
      { start: 0.7, areas: ['B4', 'E4'] },
      { start: 0.85, areas: ['A4', 'D5'] },
    ],
    [
      { start: 0, areas: ['A1'] },
      { start: 0.17964, areas: ['B1'] },
      { start: 0.34132, areas: ['C'] },
      { start: 0.62874, areas: ['B5'] },
      { start: 0.80838, areas: ['A5'] },
    ],
    [
      { start: 0, areas: ['A1'] },
      { start: 0.2, areas: ['E1', 'B8'] },
      { start: 0.5, areas: ['B7'] },
      { start: 0.7, areas: ['B6', 'E7'] },
      { start: 0.85, areas: ['A6', 'D6'] },
    ],
  ];

  return wifiSections.map((wifisection) => {
    return wifisection.map((section) => {
      const resAreas = section.areas.map((area) => {
        if (area !== 'C') {
          let newPos = Number(area.substring(1, 2)) + Number(startPos) - 1;
          if (newPos > 8) newPos -= 8;
          return area.substring(0, 1) + newPos.toString();
        } else return 'C';
      });
      return { start: section.start, areas: resAreas };
    });
  });
};
