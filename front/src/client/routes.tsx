import * as React from 'react';
import {Switch} from 'react-router-dom';
import {inject} from 'mobx-react';

import App from 'admin/pages/app';
import {ClientDataModel} from 'admin/models/client-data';

interface Props {
    clientDataModel?: ClientDataModel;
}

@inject('clientDataModel')
export class RoutesApp extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <App>
                {this.renderRouter()}
            </App>
        );
    }

    private renderRouter(): React.ReactNode {
        return (
            <Switch>
                {/* <Route exact path='/' component={GoodItemsPage} /> */}
                {/* <Route component={NotFoundPage} /> */}
            </Switch>
        );
    }
}
