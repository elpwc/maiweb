// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /auth/reset-password */
export async function resetPasswordAuth(
  body: API.ResetPasswordDto,
  options?: { [key: string]: any },
) {
  return request<any>('/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
