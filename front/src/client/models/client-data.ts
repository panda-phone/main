import {observable, action} from 'mobx';

interface GlobalProps {
    popupContent: React.ReactNode | null;
}

export class ClientDataModel {
    @observable public globalProps: GlobalProps = {
        popupContent: null
    };

    @action public setPopupContent(content: React.ReactNode | null): void {
        this.globalProps.popupContent = content;
    }
}
