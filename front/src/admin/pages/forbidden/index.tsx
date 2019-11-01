import * as React from 'react';
import {inject, observer} from 'mobx-react';

import {ClientDataModel} from 'admin/models/client-data';
import {locale} from 'admin/libs/locale';
import bevis from 'libs/bevis';

import './index.scss';

interface Props {
    clientDataModel?: ClientDataModel;
}

const b = bevis('forbidden-page');

@inject('clientDataModel')
@observer
export class ForbiddenPage extends React.Component<Props> {
    public render(): React.ReactNode {
        const authUrl = this.props.clientDataModel!.globalData.authUrl;

        return (
            <div className={b()}>
                <div className={b('container')}>
                    <img
                        src={'/public/imgs/admin/wilds/loud.gif'}
                        width={400}
                        height={300}
                    />
                    <h2>{locale.forbidden}</h2>
                    <div className={b('login-button')}>
                        {
                            authUrl && (
                                <a
                                    className={b('login-yandex')}
                                    href={authUrl}
                                >
                                    {locale.forbiddenButton}
                                </a>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    }
}
