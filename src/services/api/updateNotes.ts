// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 PATCH /notes/${param0} */
export async function updateNotes(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateNotesParams,
  body: API.UpdateNotesDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/notes/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
