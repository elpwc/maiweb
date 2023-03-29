import axios, { AxiosRequestHeaders, Method } from 'axios';
import cookie from 'react-cookies';
import appconfig from '../appconfig';

// 更新services里的接口的方法：npm run openapi

axios.defaults.withCredentials = false;

const service = axios.create({
  baseURL: appconfig.apiBaseURL + '/api/v1',
  timeout: 5000,
  responseType: 'json',
  //withCredentials: true,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
});

// interceptor
service.interceptors.request.use(
  config => {
    //token
    if (config && config.headers) {
      config.headers.token = cookie.load('token') || '';
    }
    return config;
  },
  error => {
    // bad request
    return Promise.reject(error);
  }
);

/** 错误返回格式 */
interface ErrorResponse {
  errcode: number;
  message: string;
  showType?: number;
  data?: object;
}

// 错误拦截
service.interceptors.response.use(
  res => {
    return res;
  },
  err => {
    if (!(err.response)) {
      throw err;
    }
    const errResponse = err.response;
    console.log('Oops! ', errResponse);

    switch (errResponse.status) {
      case 400:
        break;
      case 401:
        break;
      case 403:
        break;
      case 404:
        //message.error('请求的页面不存在喵');
        break;
      case 422:
        break;
      case 500:
        break;
      default:
        break;
    }

    throw errResponse;
  }
);

/** 请求格式 */
interface RequestOptions {
  data?: object;
  headers?: AxiosRequestHeaders | Record<string, string | number | boolean>;
  method?: Method;
  params?: object | URLSearchParams;
  paramsSerializer?: (params: object) => string;
  timeout?: number;
  timeoutMessage?: string;
  requestType?: 'form';
  token?: string;
}

/** 返回格式 */
interface RequestResponse<T = any> {
  data: T;
  response: Response;
}

/**
 * 请求
 * @param {string} url URL
 * @param {RequestOptions} options Request option
 * @returns {Promise<RequestResponse<T>>} Response
 * @author wniko
 */
const request = <T = any>(url: string, options?: RequestOptions): Promise<T> => {
  let headers: any = {};
  if (options?.token) {
    headers['X-Auth-Token'] = options.token;
  }
  if (options?.data && (options.data instanceof FormData || options.requestType == 'form')) {
    headers['Content-Type'] = 'multipart/form-data';
  }
  return new Promise((resolve: (value: T) => void, reject: (error: any) => void) => {
    service
      .request({
        url,
        method: options?.method,
        data: options?.data,
        params: options?.params,
        //paramsSerializer: options?.paramsSerializer,
        timeout: options?.timeout,
        timeoutErrorMessage: options?.timeoutMessage,
        headers
      })
      .then((response: any) => {
        // console.log(response);
        if (response?.data) {
          resolve(response.data as T);
        } else {
          resolve(undefined as any);
        }
      })
      .catch((err: ErrorResponse) => {
        // console.log(err);
        reject(err);
      });
  });
};

export default request;
