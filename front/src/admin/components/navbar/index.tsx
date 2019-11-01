import * as React from 'react';
import * as classnames from 'classnames';
import {Link} from 'react-router-dom';

import bevis from 'libs/bevis';

import './index.scss';

const b = bevis('navbar');

interface Page {
    path: string;
    icon: React.ReactNode;
}

interface Logo {
    path: string;
    src: string;
}

interface Props {
    pages: Page[];
    logo: Logo;
    current?: string;
}

export class Navbar extends React.Component<Props> {
    public render(): React.ReactNode {
        return (
            <div className={b()}>
                <div className={b('container')}>
                    <nav className={b('navbar')}>
                        {this.renderLogo()}
                        {this.renderMenu()}
                    </nav>
                </div>
            </div>
        );
    }

    private renderMenu(): React.ReactNode {
        if (this.props.pages.length === 0) {
            return <div className={b('menu')}/>;
        }

        const forcePath = !this.props.current ? this.props.pages[0].path : null;
        return (
            <div className={b('menu')}>
                {
                    this.props.pages.map((page, i) => (
                        <Link
                            key={`key-navbar-link-${i}`}
                            className={classnames(b('link'), {
                                active: forcePath ?
                                    forcePath === page.path :
                                    this.props.current === page.path
                            })}
                            to={page.path}
                        >
                            {page.icon}
                        </Link>
                    ))
                }
            </div>
        );
    }

    private renderLogo(): React.ReactNode {
        return (
            <a
                className={b('logo')}
                href={this.props.logo.path}
            >
                <img src={this.props.logo.src} />
            </a>
        );
    }
}
