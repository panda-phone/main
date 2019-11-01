import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {withRouter, RouteComponentProps} from 'react-router';

import {ClientDataModel} from 'admin/models/client-data';

import bevis from 'libs/bevis';

import './index.scss';

interface Props extends RouteComponentProps {
    children: React.ReactNode;
    clientDataModel?: ClientDataModel;
}

const b = bevis('client-app');

@inject('clientDataModel')
@observer
class App extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default withRouter(App);
