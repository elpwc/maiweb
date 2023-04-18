// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 GET /song/${param0} */
export async function findOneSong(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.findOneSongParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Song>(`/song/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
