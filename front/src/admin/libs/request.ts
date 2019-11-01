import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';

export function getRequest<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.get(url, {
        ...config,
        withCredentials: true
    });
}

export function postRequest<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return axios.post(url, data, {
        ...config,
        withCredentials: true
    });
}
