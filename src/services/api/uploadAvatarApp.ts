// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /upload-avatar */
export async function uploadAvatarApp(body: {}, file?: File, options?: { [key: string]: any }) {
  const formData = new FormData();

  if (file) {
    formData.append('file', file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      formData.append(
        ele,
        typeof item === 'object' && !(item instanceof File) ? JSON.stringify(item) : item,
      );
    }
  });

  return request<string>('/upload-avatar', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}
