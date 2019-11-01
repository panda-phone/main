import * as React from 'react';

import bevis from 'libs/bevis';
import DtPicker from 'react-datetime-picker';

import './index.scss';

import {ComponentChangeEvent} from 'common/types';

type ChangeHandler = (event: ComponentChangeEvent<Date>) => void;

interface Props {
    name: string;
    value: Date | null;
    placeholder: string;
    onChange: ChangeHandler;
}

const b = bevis('date-time-picker');

export class DateTimePicker extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    <label className={b('input-label')}>
                        {this.props.placeholder}
                    </label>
                    <DtPicker
                        onChange={this.changeHandler}
                        value={this.props.value}
                    />
                </div>
            </div>
        );
    }

    private changeHandler = (value: Date) => {
        const syntheticEvent: ComponentChangeEvent<Date> = {
            target: {
                value,
                name: this.props.name
            }
        };

        this.props.onChange(syntheticEvent);
    }
}
