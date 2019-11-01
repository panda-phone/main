import * as React from 'react';
import {AxiosError} from 'axios';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router';

import {ClientDataModel} from 'admin/models/client-data';
import bevis from 'libs/bevis';

import './index.scss';
import {PopupSimpleError} from 'admin/components/popup';
import {GoodPageModel} from 'admin/models/good';
import {ScreenLocker} from 'admin/components/screen-locker';
import {locale} from 'admin/libs/locale';
import {ImageButton} from 'admin/components/image-button';
import {PageStatus, ComponentChangeEvent, ApiResponse} from 'common/types';
import {SelectBox, prepareSelectBox} from 'admin/components/select-box';
import {GoodIphoneForm} from 'admin/pages/good/forms/iphone';
import {GoodAirpodsForm} from 'admin/pages/good/forms/airpods';
import {NotFoundPage} from 'admin/pages/not-found';
import {Paper} from 'admin/components/paper';
import {Title} from 'admin/components/title';

interface State {
    category: string | null;
    subcategory: string | null;
    notFound: boolean;
}

interface RouteParams {
    goodId: string;
}

interface Props extends RouteComponentProps<RouteParams> {
    clientDataModel?: ClientDataModel;
    goodPageModel?: GoodPageModel;
}

const b = bevis('good-page');

@inject('clientDataModel', 'goodPageModel')
@observer
export class GoodPage extends React.Component<Props, State> {
    public state = {category: null, subcategory: null, notFound: false};

    public componentDidMount(): void {
        this.loadData(this.props.match.params.goodId);
    }

    public render(): React.ReactNode {
        if (this.state.notFound) {
            return <NotFoundPage/>;
        }

        return (
            <div className={b()}>
                <ScreenLocker
                    transparent={true}
                    show={this.props.goodPageModel!.status === PageStatus.LOADING}
                />
                {
                    this.props.goodPageModel!.status === PageStatus.DONE &&
                    <Title
                        text={
                            this.props.goodPageModel!.isNewGood ?
                                'New good' :
                                `Good: ${this.props.goodPageModel!.data.id}`
                        }
                    />
                }
                {
                    this.props.goodPageModel!.status === PageStatus.DONE &&
                    <div className={b('container')}>
                        <Paper>
                            <div className={b('filter-container')}>
                                <SelectBox
                                    name='category'
                                    items={prepareSelectBox(this.props.goodPageModel!.dbConsts.GOOD_CATEGORY)}
                                    selected={this.state.category}
                                    placeholder={locale['goodItem.field.category']}
                                    onChange={this.filterChangeHandler}
                                />
                                <SelectBox
                                    name='subcategory'
                                    items={prepareSelectBox(this.props.goodPageModel!.dbConsts.GOOD_SUBCATEGORY)}
                                    selected={this.state.subcategory}
                                    placeholder={locale['goodItem.field.subcategory']}
                                    onChange={this.filterChangeHandler}
                                />
                            </div>
                            {this.renderForm()}
                        </Paper>
                    </div>
                }
                <div className={b('controls-container')}>
                    {
                        !this.props.goodPageModel!.isNewGood &&
                        <ImageButton
                            text={locale['button.archive']}
                            onClick={() => this.changeBranch('archive')}
                        />
                    }
                    {
                        this.props.goodPageModel!.data.branch === 'draft' &&
                        <ImageButton
                            text={locale['button.publish']}
                            onClick={() => this.changeBranch('public')}
                        />
                    }
                </div>
            </div>
        );
    }

    private renderForm = (): React.ReactNode => {
        if (!this.state.category || !this.state.subcategory) {
            return;
        }

        if (this.state.subcategory === 'iphone') {
            return (
                <GoodIphoneForm
                    dbConsts={this.props.goodPageModel!.dbConsts}
                    data={this.props.goodPageModel!.data}
                    handleSubmit={this.handleSubmit}
                />
            );
        }

        return (
            <GoodAirpodsForm
                dbConsts={this.props.goodPageModel!.dbConsts}
                data={this.props.goodPageModel!.data}
                handleSubmit={this.handleSubmit}
            />
        );
    }

    private filterChangeHandler = (event: ComponentChangeEvent<string>): void => {
        this.setState({[event.target.name]: event.target.value} as any);
    }

    private errorHandler = (error: AxiosError): void => {
        const message = error.response && error.response.data.message || error;
        if (message === ApiResponse.GOOD_NOT_EXIST) {
            this.setState({notFound: true});
        } else {
            this.showErrorMessage(message);
        }
    }

    private loadData(id: string): Promise<void> {
        return this.props.goodPageModel!.fetchData(id)
            .then(() => {
                if (!this.props.goodPageModel!.isNewGood) {
                    this.setState({
                        category: this.props.goodPageModel!.data.category,
                        subcategory: this.props.goodPageModel!.data.subcategory
                    });
                }
            })
            .catch(this.errorHandler);
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

    private changeBranch = (status: 'archive' | 'public'): void => {
        const id = this.props.match.params.goodId;
        this.props.goodPageModel!.updateBranch(id, status)
            .then(() => this.props.history.replace('/bender-root'))
            .catch(this.errorHandler);
    }

    private handleSubmit = (values: any): void => {
        this.props.goodPageModel!.updateGood({
            ...values,
            category: this.state.category,
            subcategory: this.state.subcategory
        })
            .then((response) => {
                if (this.props.goodPageModel!.isNewGood) {
                    const {id} = response.data;
                    this.props.history.replace(`/bender-root/good/${id}`);
                }

                this.loadData(this.props.match.params.goodId);
            })
            .catch(this.errorHandler);
    }
}
