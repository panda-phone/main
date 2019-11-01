import * as React from 'react';
import {inject} from 'mobx-react';

import {ClientDataModel} from 'admin/models/client-data';
import bevis from 'libs/bevis';

import './index.scss';

interface Props {
    clientDataModel?: ClientDataModel;
}

const b = bevis('not-found-page');

@inject('clientDataModel')
export class NotFoundPage extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    <img
                        src={'/public/imgs/admin/wilds/welcome.gif'}
                        width={400}
                        height={300}
                    />
                    <h2>404</h2>
                </div>
            </div>
        );
    }
}
