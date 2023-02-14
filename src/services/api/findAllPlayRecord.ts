// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 GET /play-record */
export async function findAllPlayRecord(options?: { [key: string]: any }) {
  return request<any>('/play-record', {
    method: 'GET',
    ...(options || {}),
  });
}
