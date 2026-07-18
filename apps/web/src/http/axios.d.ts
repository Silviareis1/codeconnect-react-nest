import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig<D = any> {
    requiresAuth?: boolean;
  }

  interface InternalAxiosRequestConfig<D = any> {
    requiresAuth?: boolean;
  }
}
