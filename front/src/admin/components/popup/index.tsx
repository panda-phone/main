
import * as React from 'react';
import * as classnames from 'classnames';

import bevis from 'libs/bevis';
import {CROSS_POPUP} from 'common/svg-library';

import './index.scss';

const b = bevis('popup');

interface PopupProps {
    onClose: () => void;
    show: boolean;
}

export class Popup extends React.Component<PopupProps> {
    public render(): React.ReactNode {
        return (
            <div
                className={classnames(b(), {
                    [b('hidden')]: !this.props.show
                })}
            >
                <div className={b('container')}>
                    <div className={b('wrapper')}>
                        <div
                            className={b('cross-container')}
                            onClick={this.props.onClose}
                        >
                            <div className={b('cross')}>
                                {CROSS_POPUP}
                            </div>
                        </div>
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
}

interface SimpleErrorProps {
    message: string;
    img: string;
}

export class PopupSimpleError extends React.Component<SimpleErrorProps> {
    public render(): React.ReactNode {
        const b = bevis('popup-simple-error');

        return (
            <div className={b()}>
                <img
                    src={this.props.img}
                    height={300}
                />
                <h2 className={b('header')}>{'OPS...'}</h2>
                <p className={b('text')}>{this.props.message}</p>
            </div>
        );
    }
}
