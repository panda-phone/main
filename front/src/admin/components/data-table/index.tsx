import * as React from 'react';
import {Link} from 'react-router-dom';

import bevis from 'libs/bevis';
import {locale} from 'admin/libs/locale';
import {ImageButton} from 'admin/components/image-button';
import {priceToString} from 'admin/libs/get-price';
import {TRUE, FALSE, DELETE} from 'common/svg-library';

import './index.scss';

const b = bevis('data-table');

export interface TableSchema<T extends string> extends SchemaItem {
    key: T;
}

type Type = 'boolean' | 'price-object' | 'good-properties' | 'category-data';

interface SchemaItem {
    title: string;
    key: string;
    type?: Type;
    linkTemplate?: string;
}

interface Props {
    schema: SchemaItem[];
    items: Record<string, any>[];
    linkData?: Record<string, any>;
    onDelete?: (row: any) => void;
}

export class DataTable extends React.Component<Props> {
    public render(): React.ReactNode {
        const titles = this.props.schema.map(({title}) => title);
        const rows = this.props.items;

        return (
            <div className={b()}>
                <div className={b('container')}>
                    <div className={b('table-content')}>
                        <table>
                            <thead>
                                <tr>
                                    {this.renderHeader(titles)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.renderRows(rows)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    private renderHeader(titles: string[]): React.ReactNode {
        return titles.map((title, i) => (
            <th
                key={`key-table-header-${i}`}
                className={b('header-item')}
            >
                <h2>{title}</h2>
            </th>
        ));
    }

    private renderRows(rows: any[]): React.ReactNode {
        return rows.map((row, i) => (
            <tr
                key={`key-table-row-${i}`}
                className={b('row')}
            >
                {
                    this.props.schema.map((schema, j) => {
                        const res = Object.entries(row).find(([key]) => schema.key === key)!;
                        if (!res) {
                            return;
                        }

                        const [key, value] = res;
                        return (
                            <td
                                key={`key-table-row-item-${j}`}
                                className={b('row-item')}
                            >
                                {this.renderRowItem(row, key, value)}
                            </td>
                        );
                    })
                }
                {
                    this.props.onDelete &&
                    <td
                        key={`key-table-row-item-on-delete-${i}`}
                        className={b('row-item')}
                    >
                        <ImageButton
                            icon={DELETE}
                            onClick={() => this.props.onDelete!(row)}
                        />
                    </td>
                }
            </tr>
        ));
    }

    private findSchemaProps(key: string): any | undefined {
        const item = this.props.schema.find((el) => el.key === key);
        if (!item) {
            return {};
        }

        return item;
    }

    private renderRowItem(row: any, key: string, value: any): React.ReactNode {
        if (value === null || value === undefined) {
            return '-';
        }

        const {type, linkTemplate} = this.findSchemaProps(key);
        if (type === 'boolean') {
            return (
                <div className={b('row-item_boolean')}>
                    {value ? TRUE : FALSE}
                </div>
            );
        }

        if (type === 'price-object') {
            return (
                <div className={b('row-item_price-object')}>
                    <h2>{priceToString(value)}</h2>
                    <p dangerouslySetInnerHTML={{__html: `&nbsp;-${row.discount}%`}}/>
                </div>
            );
        }

        if (type === 'good-properties') {
            return (
                <div className={b('row-item-good-properties')}>
                    <p className={b('row-item-good-props-brand')}>{value.brand}</p>
                    {
                        value.airpods &&
                        <div className={b('row-item-good-props-container')}>
                            <div>{value.airpods.model}</div>
                            <div>{value.airpods.color}</div>
                            {
                                value.airpods.wirelessCharging &&
                                <div>
                                    {locale['goodItem.field.wirelessCharging'].toLowerCase()}
                                </div>
                            }
                        </div>
                    }
                    {
                        value.iphone &&
                        <div className={b('row-item-good-props-container')}>
                            <div>{value.iphone.model}</div>
                            <div>{value.iphone.color}</div>
                            <div>{value.iphone.memory}</div>
                        </div>
                    }
                </div>
            );
        }

        if (type === 'category-data') {
            return (
                <div className={b('row-item-good-category-data')}>
                    <div className='category'>{value}</div>
                    <div className='subcategory'>{row.subcategory}</div>
                </div>
            );
        }

        if (linkTemplate) {
            const linkData = this.props.linkData || {};
            const link = Object.entries(linkData).reduce(
                (res, [key, value]) => res.replace(`:link.${key}`, value),
                linkTemplate.replace(':value', value)
            );

            return <Link to={link}>{value}</Link>;
        }

        return (
            <p className={b('row-item__simple')}>
                {value}
            </p>
        );
    }
}
