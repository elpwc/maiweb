// @ts-ignore
/* eslint-disable */
import request from '../../utils/request';

/** 此处后端没有提供注释 POST /notes */
export async function createNotes(body: API.CreateNotesDto, options?: { [key: string]: any }) {
  return request<API.Notes>('/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
