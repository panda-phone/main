import * as React from 'react';

import bevis from 'libs/bevis';

import './index.scss';

const b = bevis('check-box');

export interface CheckBoxItem {
    key: string;
    value: string;
}

interface Props {
    id: string;
    items: CheckBoxItem[];
    selected: string[];
    label?: string;
    onChange: (selected: string[]) => void;
}

export class CheckBox extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    {this.props.label && <p className={b('label')}>{this.props.label}</p>}
                    {this.renderItems()}
                </div>
            </div>
        );
    }

    private renderItems(): React.ReactNode {
        return (
            <ul className={b('list')}>
                {
                    this.props.items.map((item, i) => {
                        const id = `${item.key}&checkbox-${this.props.id}-${i}`;
                        return (
                            <li
                                key={`key-checkbox-item-${i}`}
                                className={b('item')}
                            >
                                <input
                                    type='checkbox'
                                    id={id}
                                    value={item.value}
                                    checked={this.props.selected.includes(item.key)}
                                    onChange={this.onChange}
                                />
                                <label
                                    htmlFor={id}
                                    className={b('item-label')}
                                >
                                    <svg width='18px' height='18px' viewBox='0 0 18 18'>
                                        <path
                                            d={`
                                                M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5
                                                L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z
                                            `}
                                        />
                                        <polyline points='1 9 7 14 15 4'/>
                                    </svg>
                                    <span>{item.value}</span>
                                </label>
                            </li>
                        );
                    })
                }
            </ul>
        );
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const key = event.target.id.split('&')[0];
        if (event.target.checked) {
            this.props.onChange(this.props.selected.concat(key));
        } else {
            const index = this.props.selected.indexOf(key);
            this.props.selected.splice(index, 1);
            this.props.onChange(this.props.selected.concat([]));
        }
    }
}
