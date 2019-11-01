import * as React from 'react';
import * as classnames from 'classnames';

import bevis from 'libs/bevis';

import './index.scss';

const b = bevis('image-button');

interface Props {
    icon?: React.ReactNode;
    onClick: () => void;
    text?: string;
    className?: string;
}

export class ImageButton extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={classnames(b(), this.props.className)}>
                <div className={b('container')} onClick={this.props.onClick}>
                    {
                        this.props.icon &&
                        <div
                            className={classnames(b('icon-container'), {
                                [b('margin')]: this.props.text
                            })}
                        >
                            {this.props.icon}
                        </div>
                    }
                    {this.props.text && <p>{this.props.text}</p>}
                </div>
            </div>
        );
    }
}
