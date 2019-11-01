import * as React from 'react';
import {AxiosError} from 'axios';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router';

import {ClientDataModel} from 'admin/models/client-data';
import bevis from 'libs/bevis';

import './index.scss';
import {PopupSimpleError} from 'admin/components/popup';
import {OrdersPageModel, ORDERS_TABLE_SCHEMA} from 'admin/models/orders';
import {ScreenLocker} from 'admin/components/screen-locker';
import {Pagination} from 'admin/components/pagination';
import {PageStatus} from 'common/types';
import {locale} from 'admin/libs/locale';
import {Title} from 'admin/components/title';
import {Paper} from 'admin/components/paper';
import {ImageButton} from 'admin/components/image-button';
import {PLUS} from 'common/svg-library';
import {DataTable} from 'admin/components/data-table';

interface Props extends RouteComponentProps<{}> {
    clientDataModel?: ClientDataModel;
    ordersPageModel?: OrdersPageModel;
}

const b = bevis('orders-page');

@inject('clientDataModel', 'ordersPageModel')
@observer
export class OrdersPage extends React.Component<Props> {
    public componentDidMount(): void {
        this.loadData();
    }

    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <ScreenLocker
                    transparent={true}
                    show={this.props.ordersPageModel!.status === PageStatus.LOADING}
                />
                {
                    this.props.ordersPageModel!.status === PageStatus.DONE &&
                    <div className={b('container')}>
                        <Title text={locale.orders}/>
                        {this.renderTable()}
                        <Pagination
                            limit={this.props.ordersPageModel!.pagination.limit}
                            offset={this.props.ordersPageModel!.pagination.offset}
                            total={this.props.ordersPageModel!.pagination.total}
                            onChange={(offset) => {
                                this.props.ordersPageModel!.pagination.offset = offset;
                                this.loadData();
                                window.scrollTo(0, 0);
                            }}
                        />
                    </div>
                }
            </div>
        );
    }

    private renderTable(): React.ReactNode {
        return (
            <Paper>
                <ImageButton
                    icon={PLUS}
                    text={locale['button.newOrder']}
                    onClick={() => this.props.history.push('/bender-root/order/new')}
                />
                <DataTable
                    schema={ORDERS_TABLE_SCHEMA}
                    items={this.props.ordersPageModel!.data}
                />
            </Paper>
        );
    }

    private loadData(resetPagination = false): void {
        this.props.ordersPageModel!.fetchData(resetPagination).catch((error: AxiosError) => {
            const message = error.response && error.response.data.message || error;
            this.showErrorMessage(message);
        });
    }

    private showErrorMessage(message: string): void {
        const errorComponent = (
            <PopupSimpleError
                message={message}
                img={'/public/imgs/admin/wilds/company.png'}
            />
        );

        this.props.clientDataModel!.setPopupContent(errorComponent);
    }
}
