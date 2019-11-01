import * as React from 'react';
import * as classnames from 'classnames';

import bevis from 'libs/bevis';
import {ComponentChangeEvent} from 'common/types';
import {ANGLE_DOWN} from 'common/svg-library';

import './index.scss';

const b = bevis('select-box');

export interface SelectBoxItem {
    key: string;
    value: string;
}

type ChangeHandler = (event: ComponentChangeEvent<string>) => void;

interface Props {
    name: string;
    items: SelectBoxItem[];
    selected?: string | null;
    onChange: ChangeHandler;
    placeholder?: string;
    errorMessage?: string;
}

interface State {
    opened: boolean;
}

export class SelectBox extends React.Component<Props, State> {
    public state = {opened: false};

    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')} >
                    <label className={b('placeholder')}>{this.props.placeholder || ''}</label>
                    <label className={b('label-error')}>{this.props.errorMessage}</label>
                    <div
                        tabIndex={1}
                        onBlur={this.onBlurHandler}
                        onClick={this.onClickHandler}
                        className={classnames(b('wrapper'), {
                            opened: this.state.opened
                        })}
                    >
                        {this.props.items.map((item, i) => {
                            return (
                                <div
                                    key={`key-select-box-input-${i}`}
                                    className={classnames(b('value'), {
                                        visible: this.props.selected === item.key
                                    })}
                                >
                                    <input
                                        className={b('input')}
                                        type='radio'
                                    />
                                    <p className={b('input-text')}>{item.value}</p>
                                </div>
                            );
                        })}
                        {ANGLE_DOWN}
                    </div>
                    <ul className={b('list')}>
                        {this.props.items.map((item, i) => {
                            return (
                                <li key={`key-select-box-li-${i}`}>
                                    <label
                                        htmlFor={item.key}
                                        onMouseDown={this.onItemClickHandler}
                                        className={classnames(b('option'), {
                                            [b('option-selected')]: this.props.selected === item.key
                                        })}
                                    >
                                        {item.value}
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        );
    }

    private onBlurHandler = () => {
        this.setState({opened: false});
    }

    private onClickHandler = () => {
        this.setState({opened: !this.state.opened});
    }

    private onItemClickHandler = (event: React.MouseEvent<HTMLLabelElement, MouseEvent>) => {
        const key = (event.target as HTMLElement).getAttribute('for');
        const syntheticEvent: ComponentChangeEvent<string> = {
            target: {
                value: key!,
                name: this.props.name
            }
        };

        this.props.onChange(syntheticEvent);
    }
}

export function prepareSelectBox(object: Record<string, any>): SelectBoxItem[] {
    return Object.entries(object).map(([_, value]) => ({key: value, value}));
}
