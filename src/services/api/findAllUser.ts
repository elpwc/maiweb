// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 GET /user */
export async function findAllUser(options?: { [key: string]: any }) {
  return request<API.UserInfoDto[]>('/user', {
    method: 'GET',
    ...(options || {}),
  });
}
