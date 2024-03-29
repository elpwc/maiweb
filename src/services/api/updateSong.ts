// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

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
