import * as React from 'react';
import {Fragment} from 'react';
import {Formik, Field, FieldProps, FormikProps} from 'formik';
import {AxiosError} from 'axios';
import {inject, observer} from 'mobx-react';
import {RouteComponentProps} from 'react-router';

import {ClientDataModel} from 'admin/models/client-data';
import bevis from 'libs/bevis';

import {PopupSimpleError} from 'admin/components/popup';
import {ScreenLocker} from 'admin/components/screen-locker';
import {PageStatus, ApiResponse} from 'common/types';
import {NotFoundPage} from 'admin/pages/not-found';
import {ImageButton} from 'admin/components/image-button';
import {EditText} from 'admin/components/edit-text';
import {yup} from 'admin/libs/yup';
import {locale} from 'admin/libs/locale';
import {DataTable} from 'admin/components/data-table';
import {GOODS_TABLE_SCHEMA} from 'admin/models/goods';
import {OrderItemPageModel} from 'admin/models/order-item';
import {Title} from 'admin/components/title';
import {Paper} from 'admin/components/paper';

import './index.scss';

interface FormValues {
    goodId: string;
    serialNumber: string | null;
}

interface State {
    notFound: boolean;
}

interface RouteParams {
    orderItemId: string;
    orderId: string;
}

interface Props extends RouteComponentProps<RouteParams> {
    clientDataModel?: ClientDataModel;
    orderItemPageModel?: OrderItemPageModel;
}

const b = bevis('order-item-page');

const validationSchema = yup.object().shape<FormValues>({
    goodId: yup.string().required(),
    serialNumber: yup.string().nullable().ensure().default('')
});

@inject('clientDataModel', 'orderItemPageModel')
@observer
export class OrderItemPage extends React.Component<Props, State> {
    public state = {notFound: false};
    private formikRef: React.RefObject<Formik<FormValues>> = React.createRef();

    public componentDidMount(): void {
        this.loadData(this.props.match.params.orderItemId);
    }

    public render(): React.ReactNode {
        if (this.state.notFound) {
            return <NotFoundPage/>;
        }

        return (
            <div className={b()}>
                <ScreenLocker
                    transparent={true}
                    show={this.props.orderItemPageModel!.status === PageStatus.LOADING}
                />
                {
                    this.props.orderItemPageModel!.status === PageStatus.DONE &&
                    <Title
                        text={
                            this.props.orderItemPageModel!.isNewOrderItem ?
                                'New order item' :
                                `Order item: ${this.props.orderItemPageModel!.data.id}`
                        }
                    />
                }
                {
                    this.props.orderItemPageModel!.status === PageStatus.DONE &&
                    <div className={b('container')}>
                        {this.renderFormContainer()}
                    </div>
                }
                {
                    this.props.orderItemPageModel!.status === PageStatus.DONE &&
                    !this.props.orderItemPageModel!.isNewOrderItem &&
                    this.renderTable()
                }
            </div>
        );
    }

    private renderFormContainer(): React.ReactNode {
        return (
            <Paper>
                <div className={b('form-container')}>
                    <Formik
                        ref={this.formikRef}
                        initialValues={validationSchema.cast(this.props.orderItemPageModel!.data)}
                        onSubmit={this.handleSubmit}
                        validationSchema={validationSchema}
                        render={this.renderForm}
                        enableReinitialize
                    />
                    <ImageButton
                        text={locale['button.save']}
                        onClick={() => this.formikRef.current!.submitForm()}
                    />
                </div>
            </Paper>
        );
    }

    private renderTable(): React.ReactNode {
        return (
            <Paper>
                <DataTable
                    items={[this.props.orderItemPageModel!.data]}
                    schema={GOODS_TABLE_SCHEMA.filter(({key}) => key !== 'id')}
                />
            </Paper>
        );
    }

    private renderForm = (formikProps: FormikProps<FormValues>): React.ReactNode => {
        return (
            <Fragment>
                <Field
                    name={'goodId'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['editText.goodId']}
                            onChange={field.onChange}
                            errorMessage={formikProps.errors.goodId}
                        />
                    )}
                />
                <Field
                    name={'serialNumber'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['orderItem.field.serialNumber']}
                            onChange={field.onChange}
                            errorMessage={formikProps.errors.serialNumber}
                        />
                    )}
                />
            </Fragment>
        );
    }

    private errorHandler = (error: AxiosError): void => {
        const message = error.response && error.response.data.message || error;
        if (message === ApiResponse.ORDER_ITEM_NOT_EXIST) {
            this.setState({notFound: true});
        } else {
            this.showErrorMessage(message);
        }
    }

    private loadData(id: string): Promise<void> {
        return this.props.orderItemPageModel!.fetchData(id).catch(this.errorHandler);
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

    private handleSubmit = (values: any): void => {
        const orderId = this.props.match.params.orderId;
        this.props.orderItemPageModel!.updateOrderItem(validationSchema.cast(values), orderId)
            .then((response) => {
                if (this.props.orderItemPageModel!.isNewOrderItem) {
                    const {id} = response.data;
                    this.props.history.replace(`/bender-root/order/${orderId}/${id}`);
                }
                this.loadData(this.props.match.params.orderItemId);
            })
            .catch(this.errorHandler);
    }
}
