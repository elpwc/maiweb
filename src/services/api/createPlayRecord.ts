// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /play-record */
export async function createPlayRecord(
  body: API.CreatePlayRecordDto,
  options?: { [key: string]: any },
) {
  return request<any>('/play-record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
