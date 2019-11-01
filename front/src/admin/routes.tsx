import * as React from 'react';
import {inject, observer} from 'mobx-react';
import {Switch, Route} from 'react-router-dom';

import App from 'admin/pages/app';
import {GoodsPage} from 'admin/pages/goods';
import {GoodPage} from 'admin/pages/good';
import {NotFoundPage} from 'admin/pages/not-found';
import {OrdersPage} from 'admin/pages/orders';
import {OrderPage} from 'admin/pages/order';
import {OrderItemPage} from 'admin/pages/order-item';
import {ForbiddenPage} from 'admin/pages/forbidden';
import {ClientDataModel} from 'admin/models/client-data';
import {ScreenLocker} from 'admin/components/screen-locker';

interface Props {
    clientDataModel?: ClientDataModel;
}

@inject('clientDataModel')
@observer
export class RoutesApp extends React.Component<Props> {
    public componentDidMount(): void {
        this.props.clientDataModel!.checkAccess();
    }

    public render(): React.ReactNode {
        return (
            <App>
                {this.renderRouter()}
            </App>
        );
    }

    private renderRouter(): React.ReactNode {
        if (this.props.clientDataModel!.globalData.forbidden === undefined) {
            return (
                <ScreenLocker
                    show={true}
                />
            );
        }

        return (
            <Switch>
                <Route exact path='/bender-root' component={GoodsPage}/>
                <Route exact path='/bender-root/good/:goodId' component={GoodPage}/>
                <Route exact path='/bender-root/orders' component={OrdersPage}/>
                <Route exact path='/bender-root/order/:orderId' component={OrderPage}/>
                <Route exact path='/bender-root/order/:orderId/:orderItemId' component={OrderItemPage}/>
                <Route component={NotFoundPage}/>
            </Switch>
        );
    }
}
