import * as React from 'react';
import * as classnames from 'classnames';

import bevis from 'libs/bevis';

import './index.scss';

const b = bevis('screen-locker');

interface Props {
    transparent?: boolean;
    show?: boolean;
}

export class ScreenLocker extends React.Component<Props> {
    public render(): React.ReactNode {
        document.body.style.overflow = this.props.show ? 'hidden' : 'scroll';

        return (
            <div
                className={classnames(b(), {
                    ['transparent']: this.props.transparent,
                    ['hidden']: !this.props.show
                })}
            >
                <div className={b('container')}>
                    {/* TODO remove bg in gifs */}
                    <img
                        src={'/public/imgs/admin/wilds/sleep.gif'}
                        width={400}
                        height={300}
                    />
                </div>
            </div>
        );
    }
}
