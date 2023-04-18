// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /auth/register */
export async function registerAuth(body: API.RegisterDto, options?: { [key: string]: any }) {
  return request<API.WhoamiDto>('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
