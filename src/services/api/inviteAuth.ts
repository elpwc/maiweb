// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /auth/invite */
export async function inviteAuth(body: API.InviteDto, options?: { [key: string]: any }) {
  return request<API.InvitationCodeListDto>('/auth/invite', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
