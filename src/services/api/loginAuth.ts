// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /auth/login */
export async function loginAuth(body: API.LoginDto, options?: { [key: string]: any }) {
  return request<API.WhoamiDto>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
