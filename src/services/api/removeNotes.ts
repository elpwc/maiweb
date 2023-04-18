// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 DELETE /notes/${param0} */
export async function removeNotes(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.removeNotesParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/notes/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
