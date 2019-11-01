import * as React from 'react';
import {AxiosError} from 'axios';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router';

import {ClientDataModel} from 'admin/models/client-data';
import bevis from 'libs/bevis';

import './index.scss';
import {PopupSimpleError} from 'admin/components/popup';
import {GoodsPageModel, GOODS_TABLE_SCHEMA} from 'admin/models/goods';
import {ScreenLocker} from 'admin/components/screen-locker';
import {CheckBox} from 'admin/components/check-box';
import {Pagination} from 'admin/components/pagination';
import {PageStatus} from 'common/types';
import {locale} from 'admin/libs/locale';
import {Title} from 'admin/components/title';
import {Paper} from 'admin/components/paper';
import {ImageButton} from 'admin/components/image-button';
import {PLUS} from 'common/svg-library';
import {DataTable} from 'admin/components/data-table';
import {EditText} from 'admin/components/edit-text';

interface Props extends RouteComponentProps<{}> {
    clientDataModel?: ClientDataModel;
    goodsPageModel?: GoodsPageModel;
}

const b = bevis('goods-page');

@inject('clientDataModel', 'goodsPageModel')
@observer
export class GoodsPage extends React.Component<Props> {
    public componentDidMount(): void {
        this.loadData();
    }

    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <ScreenLocker
                    transparent={true}
                    show={this.props.goodsPageModel!.status === PageStatus.LOADING}
                />
                {
                    this.props.goodsPageModel!.status === PageStatus.DONE &&
                    <div className={b('container')}>
                        <Title text={locale.goods}/>
                        {this.renderFilter()}
                        {this.renderTable()}
                        {
                            this.props.goodsPageModel!.pagination.total !== 0 &&
                            <Pagination
                                limit={this.props.goodsPageModel!.pagination.limit}
                                offset={this.props.goodsPageModel!.pagination.offset}
                                total={this.props.goodsPageModel!.pagination.total}
                                onChange={(offset) => {
                                    this.props.goodsPageModel!.pagination.offset = offset;
                                    this.loadData();
                                    window.scrollTo(0, 0);
                                }}
                            />
                        }
                    </div>
                }
            </div>
        );
    }

    private loadData(resetPagination = false): void {
        this.props.goodsPageModel!.fetchData(resetPagination).catch((error: AxiosError) => {
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

    private renderTable(): React.ReactNode {
        return (
            <Paper>
                <ImageButton
                    icon={PLUS}
                    text={locale['button.newGood']}
                    onClick={() => this.props.history.push('/bender-root/good/new')}
                />
                <DataTable
                    schema={GOODS_TABLE_SCHEMA}
                    items={this.props.goodsPageModel!.data}
                />
            </Paper>
        );
    }

    private renderFilter(): React.ReactNode {
        const model = this.props.goodsPageModel!;

        return (
            <div>
                <Paper>
                    <div className={b('filter-container')}>
                        <div className={b('filter-item')}>
                            <CheckBox
                                id='category'
                                label={locale['goodItem.field.category']}
                                items={model.filter.category.items}
                                selected={model.filter.category.selected}
                                onChange={(selected) => {
                                    model.filter.category.selected = selected;
                                }}
                            />
                        </div>
                        <div className={b('filter-item')}>
                            <CheckBox
                                id='branch'
                                label={locale['goodItem.field.branch']}
                                items={model.filter.branch.items}
                                selected={model.filter.branch.selected}
                                onChange={(selected) => {
                                    model.filter.branch.selected = selected;
                                }}
                            />
                        </div>
                        <div className={b('filter-item')}>
                            <CheckBox
                                id='original'
                                label={locale['goodItem.field.original']}
                                items={model.filter.original.items}
                                selected={model.filter.original.selected}
                                onChange={(selected) => {
                                    model.filter.original.selected = selected;
                                }}
                            />
                        </div>
                    </div>
                    <div className={b('filter-container')}>
                        <EditText
                            name='goodId'
                            value={model.filter.goodId}
                            placeholder={locale['editText.goodId']}
                            onChange={({target: {value}}) => {
                                model.filter.goodId = value;
                            }}
                        />
                    </div>
                    <ImageButton
                        text={locale['button.applySearch']}
                        onClick={this.applySearchHandler}
                    />
                </Paper>
            </div>
        );
    }

    private applySearchHandler = (): void => {
        this.loadData(true);
    }
}
