import * as React from 'react';

import bevis from 'libs/bevis';

import './index.scss';
import {ComponentChangeEvent} from 'common/types';

const b = bevis('switcher');

type ChangeHandler = (event: ComponentChangeEvent<boolean>) => void;

interface Props {
    name: string;
    value: boolean;
    onChange: ChangeHandler;
    label?: string;
}

export class Switcher extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                {this.props.label && <p>{this.props.label}</p>}
                <label className={b('container')}>
                    <input
                        type='checkbox'
                        checked={this.props.value}
                        onChange={this.onChange}
                    />
                    <span className={b('slider')}/>
                </label>
            </div>
        );
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const syntheticEvent: ComponentChangeEvent<boolean> = {
            target: {
                value: event.target.checked,
                name: this.props.name
            }
        };

        this.props.onChange(syntheticEvent);
    }
}
