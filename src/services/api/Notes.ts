// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** get all notes GET /notes */
export async function findAllNotes(options?: { [key: string]: any }) {
  return request<any>('/notes', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Create notes POST /notes */
export async function createNotes(body: API.CreateNotesDto, options?: { [key: string]: any }) {
  return request<any>('/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /notes/${param0} */
export async function findOneNotes(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.findOneNotesParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/notes/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

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
