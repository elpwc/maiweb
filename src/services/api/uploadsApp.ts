// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 GET /uploads/${param0} */
export async function uploadsApp(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.uploadsAppParams,
  options?: { [key: string]: any },
) {
  const { filename: param0, ...queryParams } = params;
  return request<any>(`/uploads/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
