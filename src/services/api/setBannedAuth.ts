// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /auth/set-banned */
export async function setBannedAuth(body: API.SetBannedDto, options?: { [key: string]: any }) {
  return request<any>('/auth/set-banned', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
