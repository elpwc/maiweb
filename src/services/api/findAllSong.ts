// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 GET /song */
export async function findAllSong(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.findAllSongParams,
  options?: { [key: string]: any },
) {
  return request<API.Song[]>('/song', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
