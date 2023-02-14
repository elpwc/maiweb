// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** Get all songs GET /song */
export async function findAllSong(options?: { [key: string]: any }) {
  return request<any>('/song', {
    method: 'GET',
    ...(options || {}),
  });
}

/** Create song POST /song */
export async function createSong(body: API.CreateSongDto, options?: { [key: string]: any }) {
  return request<any>('/song', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 GET /song/${param0} */
export async function findOneSong(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.findOneSongParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/song/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 DELETE /song/${param0} */
export async function removeSong(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.removeSongParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/song/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 此处后端没有提供注释 PATCH /song/${param0} */
export async function updateSong(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateSongParams,
  body: API.UpdateSongDto,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<any>(`/song/${param0}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}
