// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /song */
export async function createSong(body: API.CreateSongDto, options?: { [key: string]: any }) {
  return request<API.Song>('/song', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
