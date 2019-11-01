import * as React from 'react';
import * as classnames from 'classnames';

import bevis from 'libs/bevis';
import {ComponentChangeEvent} from 'common/types';

import './index.scss';

const b = bevis('edit-text');

type ChangeHandler = (event: ComponentChangeEvent<string>) => void;

interface Props {
    name: string;
    value: string;
    placeholder: string;
    onChange: ChangeHandler;
    errorMessage?: string;
}

export class EditText extends React.Component<Props> {
    public render(): React.ReactNode {
        const id = `id_${this.props.name}`;
        return (
            <div className={b()}>
                <div className={b('container')}>
                    <div className={b('wrapper')}>
                        <div
                            className={classnames(b('input-container'), {
                                [b('input-error')]: Boolean(this.props.errorMessage)
                            })}
                        >
                            <input
                                type='text'
                                id={id}
                                value={this.props.value}
                                onChange={this.onChange}
                                className={b('input-text')}
                                placeholder={this.props.placeholder}
                            />
                            <label
                                htmlFor={id}
                                className={b('input-label')}
                            >
                                {this.props.placeholder}
                            </label>
                            <label
                                htmlFor={id}
                                className={classnames(b('input-label'), b('input-label-error'))}
                            >
                                {this.props.errorMessage}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const syntheticEvent: ComponentChangeEvent<string> = {
            target: {
                value: event.target.value,
                name: this.props.name
            }
        };

        this.props.onChange(syntheticEvent);
    }
}
