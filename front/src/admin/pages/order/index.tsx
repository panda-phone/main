import * as React from 'react';
import {Fragment} from 'react';
import {PhoneNumberFormat as PNF, PhoneNumberUtil} from 'google-libphonenumber';
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
import {OrderPageModel, ORDER_ITEM_TABLE_SCHEMA} from 'admin/models/order';
import {EditText} from 'admin/components/edit-text';
import {yup} from 'admin/libs/yup';
import {Switcher} from 'admin/components/switcher';
import {locale} from 'admin/libs/locale';
import {Title} from 'admin/components/title';
import {Paper} from 'admin/components/paper';
import {ImageButton} from 'admin/components/image-button';
import {PLUS} from 'common/svg-library';
import {DataTable} from 'admin/components/data-table';
import {DateTimePicker} from 'admin/components/date-time-picker';
import {transformPhone} from 'admin/libs/text-transform';
import {getSumWithDiscountString} from 'admin/libs/get-price';

import './index.scss';

interface FormValues {
    customerName: string;
    customerPhone: string;
    called: boolean;
    deliveryDate: Date | null;
    deliveryAddress: string | null;
}

interface State {
    notFound: boolean;
}

interface RouteParams {
    orderId: string;
}

interface Props extends RouteComponentProps<RouteParams> {
    clientDataModel?: ClientDataModel;
    orderPageModel?: OrderPageModel;
}

const b = bevis('order-page');
const phoneUtil = PhoneNumberUtil.getInstance();

function checkPhone(value: string): boolean {
    try {
        const number = phoneUtil.parse(value, 'RU');
        phoneUtil.format(number, PNF.INTERNATIONAL);
        return true;
        // tslint:disable-next-line
    } catch (_) {
        return false;
    }
}

const validationSchema = yup.object().shape<FormValues>({
    customerName: yup.string().required(),
    customerPhone: yup.string().required().test('phone', 'Invalid phone', checkPhone),
    called: yup.boolean().default(false),
    deliveryDate: yup.date().nullable().default(null),
    deliveryAddress: yup.string().nullable().ensure().default('')
});

@inject('clientDataModel', 'orderPageModel')
@observer
export class OrderPage extends React.Component<Props, State> {
    public state = {notFound: false};
    private formikRef: React.RefObject<Formik<FormValues>> = React.createRef();

    public componentDidMount(): void {
        this.loadData(this.props.match.params.orderId);
    }

    public render(): React.ReactNode {
        if (this.state.notFound) {
            return <NotFoundPage/>;
        }

        return (
            <div className={b()}>
                <ScreenLocker
                    transparent={true}
                    show={this.props.orderPageModel!.status === PageStatus.LOADING}
                />
                {
                    this.props.orderPageModel!.status === PageStatus.DONE &&
                    <Title
                        text={
                            this.props.orderPageModel!.isNewOrder ?
                                'New order' :
                                `Order: ${this.props.orderPageModel!.orderData.id}`
                        }
                    />
                }
                {
                    this.props.orderPageModel!.status === PageStatus.DONE &&
                    <div className={b('container')}>
                        {this.renderFormContainer()}
                    </div>
                }
                {
                    !this.props.orderPageModel!.isNewOrder &&
                    this.renderTable()
                }
                {
                    !this.props.orderPageModel!.isNewOrder &&
                    this.renderControls()
                }
            </div>
        );
    }

    private renderControls(): React.ReactNode {
        const total = getSumWithDiscountString(
            this.props.orderPageModel!.orderItems
                .map(({price, discount}) => ({price, discount}))
        );

        return (
            <div className={b('controls-container')}>
                <ImageButton
                    text={locale['button.resolve']}
                    onClick={() => this.changeResolution('resolve')}
                />
                <ImageButton
                    text={locale['button.reject']}
                    onClick={() => this.changeResolution('reject')}
                />
                <p className={b('result-price')}>{
                    `Total: ${total}`
                }</p>
            </div>
        );
    }

    private renderFormContainer(): React.ReactNode {
        return (
            <Paper>
                <div className={b('form-container')}>
                    <Formik
                        ref={this.formikRef}
                        initialValues={validationSchema.cast(this.props.orderPageModel!.orderData)}
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
        const orderId = this.props.orderPageModel!.orderData.id;
        return (
            <Paper>
                <ImageButton
                    className={b('new-order-item')}
                    icon={PLUS}
                    text={locale['button.newOrderItem']}
                    onClick={() => this.props.history.push(`/bender-root/order/${orderId}/new`)}
                />
                <DataTable
                    schema={ORDER_ITEM_TABLE_SCHEMA}
                    items={this.props.orderPageModel!.orderItems}
                    linkData={{orderId}}
                    onDelete={this.onDeleteHandler}
                />
            </Paper>
        );
    }

    private renderForm = (formikProps: FormikProps<FormValues>): React.ReactNode => {
        return (
            <Fragment>
                <Field
                    name={'called'}
                    render={({field}: FieldProps) => (
                        <Switcher
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            label={locale['orderItem.field.called']}
                        />
                    )}
                />
                <Field
                    name={'customerName'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['orderItem.field.customerName']}
                            onChange={field.onChange}
                            errorMessage={formikProps.errors.customerName}
                        />
                    )}
                />
                <Field
                    name={'customerPhone'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['orderItem.field.customerPhone']}
                            onChange={(e) => {
                                e.target.value = transformPhone(e.target.value);
                                field.onChange(e);
                            }}
                            errorMessage={formikProps.errors.customerPhone}
                        />
                    )}
                />
                <Field
                    name={'deliveryAddress'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['orderItem.field.deliveryAddress']}
                            onChange={field.onChange}
                            errorMessage={formikProps.errors.deliveryAddress}
                        />
                    )}
                />
                <Field
                    name={'deliveryDate'}
                    render={({field}: FieldProps) => (
                        <DateTimePicker
                            name={field.name}
                            value={field.value}
                            placeholder={locale['orderItem.field.deliveryDate']}
                            onChange={field.onChange}
                        />
                    )}
                />
            </Fragment>
        );
    }

    private onDeleteHandler = (row: any): void => {
        this.props.orderPageModel!.deleteOrderItem(row.id)
            .then(() => this.loadData(this.props.match.params.orderId))
            .catch(this.errorHandler);
    }

    private errorHandler = (error: AxiosError): void => {
        const message = error.response && error.response.data.message || error;
        if (message === ApiResponse.ORDER_NOT_EXIST) {
            this.setState({notFound: true});
        } else {
            this.showErrorMessage(message);
        }
    }

    private loadData(id: string): Promise<void> {
        return this.props.orderPageModel!.fetchData(id).catch(this.errorHandler);
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

    private changeResolution = (status: 'resolve' | 'reject'): void => {
        const id = this.props.match.params.orderId;
        this.props.orderPageModel!.setOrderResolution(id, status)
            .then(() => this.props.history.replace('/bender-root/orders'))
            .catch(this.errorHandler);
    }

    private handleSubmit = (values: any): void => {
        this.props.orderPageModel!.updateOrder(validationSchema.cast(values))
            .then((response) => {
                if (this.props.orderPageModel!.isNewOrder) {
                    const {id} = response.data;
                    this.props.history.replace(`/bender-root/order/${id}`);
                }
                this.loadData(this.props.match.params.orderId);
            })
            .catch(this.errorHandler);
    }
}
