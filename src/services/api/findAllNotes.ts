// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 GET /notes */
export async function findAllNotes(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.findAllNotesParams,
  options?: { [key: string]: any },
) {
  return request<API.Notes[]>('/notes', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
