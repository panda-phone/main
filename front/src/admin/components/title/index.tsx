import * as React from 'react';

import bevis from 'libs/bevis';

import './index.scss';

const b = bevis('title');

interface Props {
    text: string;
}

export class Title extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    <h1>{this.props.text}</h1>
                </div>
            </div>
        );
    }
}
