import {AxiosResponse} from 'axios';
import * as browserCookie from 'browser-cookies';
import {observable, action, runInAction} from 'mobx';

import {getRequest} from 'admin/libs/request';

interface GlobalProps {
    popupContent: React.ReactNode | null;
}

interface GlobalData {
    forbidden?: boolean;
    authUrl?: string;
}

export class ClientDataModel {
    @observable public globalData: GlobalData = {};
    @observable public globalProps: GlobalProps = {
        popupContent: null
    };
    @observable public dbConsts: any = {};

    @action public setPopupContent(content: React.ReactNode | null): void {
        this.globalProps.popupContent = content;
    }

    @action public checkAccess(): void {
        runInAction(() => {
            getRequest(`/api/v1/check_access${window.location.search}`)
                .then((response: any) => {
                    this.globalData.forbidden = false;
                    if (browserCookie.get('admin_session')) {
                        return;
                    }

                    browserCookie.set('admin_session', response.data.token);
                    window.location.replace(location.pathname);
                })
                .catch((error) => {
                    this.globalData.forbidden = true;

                    if (error.response && error.response.status === 403) {
                        this.globalData.authUrl = error.response.data.message;
                    }
                });
        });
    }
}
