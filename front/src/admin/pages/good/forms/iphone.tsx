import * as React from 'react';
import {Fragment} from 'react';
import * as objectPath from 'object-path';
import {Field, FormikProps, Formik, FieldProps} from 'formik';

import {EditText} from 'admin/components/edit-text';
import {locale} from 'admin/libs/locale';
import {yup} from 'admin/libs/yup';
import {ImageButton} from 'admin/components/image-button';
import {Switcher} from 'admin/components/switcher';
import {SelectBox, prepareSelectBox} from 'admin/components/select-box';
import {DefaultGoodValues} from 'admin/pages/good/forms/default';
import {transformNumber} from 'admin/libs/text-transform';

interface FormValues extends DefaultGoodValues {
    properties: {
        brand: string;
        iphone: {
            memory: string;
            color: string;
            model: string;
        };
    };
}

interface Props {
    dbConsts: any;
    data: any;
    handleSubmit: (values: any) => void;
}

const validationSchema = yup.object().shape<FormValues>({
    original: yup.boolean().required().default(false),
    branch: yup.string().required().default('draft'),
    price: yup.number().integer().min(0).required(),
    discount: yup.number().integer().max(100).min(0).required(),
    properties: yup.object().shape({
        brand: yup.string().required(),
        iphone: yup.object().shape({
            color: yup.string().required(),
            model: yup.string().required(),
            memory: yup.string().required()
        })
    }).required()
});

export class GoodIphoneForm extends React.Component<Props> {
    private formikRef: React.RefObject<Formik<FormValues>> = React.createRef();

    public render(): React.ReactNode {
        return (
            <div>
                <Formik
                    ref={this.formikRef}
                    initialValues={validationSchema.cast(this.props.data)}
                    onSubmit={this.props.handleSubmit}
                    validationSchema={validationSchema}
                    render={this.renderForm}
                    enableReinitialize
                />
                <ImageButton
                    text={locale['button.save']}
                    onClick={() => this.formikRef.current!.submitForm()}
                />
            </div>
        );
    }

    private renderForm = (formikProps: FormikProps<FormValues>): React.ReactNode => {
        return (
            <Fragment>
                <Field
                    name={'original'}
                    render={({field}: FieldProps) => (
                        <Switcher
                            name={field.name}
                            value={field.value}
                            onChange={field.onChange}
                            label={locale['goodItem.field.original']}
                        />
                    )}
                />
                <Field
                    name={'properties.brand'}
                    render={({field}: FieldProps) => (
                        <SelectBox
                            name={field.name}
                            items={prepareSelectBox(this.props.dbConsts.GOOD_BRAND)}
                            selected={field.value || null}
                            placeholder={locale['goodItem.field.brand']}
                            onChange={field.onChange}
                            errorMessage={objectPath.get(formikProps.errors, 'properties.brand')}
                        />
                    )}
                />
                <Field
                    name={'properties.iphone.model'}
                    render={({field}: FieldProps) => (
                        <SelectBox
                            name={field.name}
                            items={prepareSelectBox(this.props.dbConsts.GOOD_IPHONE_MODEL)}
                            selected={field.value || null}
                            placeholder={locale['goodItem.field.model']}
                            onChange={field.onChange}
                            errorMessage={objectPath.get(formikProps.errors, 'properties.iphone.model')}
                        />
                    )}
                />
                <Field
                    name={'properties.iphone.color'}
                    render={({field}: FieldProps) => (
                        <SelectBox
                            name={field.name}
                            items={prepareSelectBox(this.props.dbConsts.GOOD_IPHONE_COLOR)}
                            selected={field.value || null}
                            placeholder={locale['goodItem.field.color']}
                            onChange={field.onChange}
                            errorMessage={objectPath.get(formikProps.errors, 'properties.iphone.color')}
                        />
                    )}
                />
                <Field
                    name={'properties.iphone.memory'}
                    render={({field}: FieldProps) => (
                        <SelectBox
                            name={field.name}
                            items={prepareSelectBox(this.props.dbConsts.GOOD_IPHONE_MEMORY)}
                            selected={field.value || null}
                            placeholder={locale['goodItem.field.memory']}
                            onChange={field.onChange}
                            errorMessage={objectPath.get(formikProps.errors, 'properties.iphone.memory')}
                        />
                    )}
                />
                <Field
                    name={'price'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['goodItem.field.price']}
                            onChange={(e) => {
                                e.target.value = transformNumber(e.target.value);
                                field.onChange(e);
                            }}
                            errorMessage={formikProps.errors.price}
                        />
                    )}
                />
                <Field
                    name={'discount'}
                    render={({field}: FieldProps) => (
                        <EditText
                            name={field.name}
                            value={field.value}
                            placeholder={locale['goodItem.field.discount']}
                            onChange={(e) => {
                                e.target.value = transformNumber(e.target.value);
                                field.onChange(e);
                            }}
                            errorMessage={formikProps.errors.discount}
                        />
                    )}
                />
            </Fragment>
        );
    }
}
