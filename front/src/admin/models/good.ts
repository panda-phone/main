import {AxiosResponse, AxiosError} from 'axios';
import {observable, action, runInAction} from 'mobx';
import {PageStatus, NEW_ID} from 'common/types';
import {getRequest, postRequest} from 'admin/libs/request';

export class GoodPageModel {
    @observable public status = PageStatus.LOADING;
    @observable public isNewGood = true;
    @observable public data: any = {};
    @observable public dbConsts: any = {};

    @action public fetchData(id: string): Promise<void> {
        this.isNewGood = id === NEW_ID;

        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;

                Promise.all([
                    this.isNewGood ? Promise.resolve({data: {}} as any) : getRequest(`/api/v1/good/${id}/get`),
                    getRequest('/api/v1/public/get_consts')
                ])
                .then(([response, constResponse]: [AxiosResponse<any>, AxiosResponse<any>]) => {
                    this.data = response.data;
                    this.dbConsts = constResponse.data;
                    this.status = PageStatus.DONE;
                    resolve();
                })
                .catch((error: AxiosError) => {
                    this.status = PageStatus.FAIL;
                    reject(error);
                });
            });
        });
    }

    @action public updateGood(data: any): Promise<AxiosResponse> {
        if (this.isNewGood) {
            return new Promise((resolve, reject) => {
                runInAction(() => {
                    this.status = PageStatus.LOADING;

                    postRequest(`/api/v1/good/create`, data)
                        .then(resolve)
                        .catch(reject)
                        .finally(() => this.status = PageStatus.DONE);
                });
            });
        }

        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;

                const id = data.id;
                delete data.id;
                delete data.updated;

                postRequest(`/api/v1/good/${id}/update`, data)
                    .then(resolve)
                    .catch(reject)
                    .finally(() => this.status = PageStatus.DONE);
            });
        });
    }

    @action public updateBranch(id: string, branch: string): Promise<any> {
        return new Promise((resolve, reject) => {
            runInAction(() => {
                this.status = PageStatus.LOADING;

                postRequest(`/api/v1/good/${id}/update_branch`, {branch})
                    .then(resolve)
                    .catch(reject)
                    .finally(() => this.status = PageStatus.DONE);
            });
        });
    }
}
