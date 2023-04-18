// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /auth/request-password-reset */
export async function requestPasswordResetAuth(
  body: API.RequestPasswordResetDto,
  options?: { [key: string]: any },
) {
  return request<any>('/auth/request-password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
