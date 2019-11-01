import * as React from 'react';
import {observer, inject} from 'mobx-react';
import {withRouter, RouteComponentProps} from 'react-router';

import {ClientDataModel} from 'admin/models/client-data';
import {Navbar} from 'admin/components/navbar';
import {Popup} from 'admin/components/popup';
import {CLIPBOARD, WALLET} from 'common/svg-library';
import {ForbiddenPage} from 'admin/pages/forbidden';

import bevis from 'libs/bevis';

import './index.scss';

interface Props extends RouteComponentProps {
    children: React.ReactNode;
    clientDataModel?: ClientDataModel;
}

const b = bevis('admin-app');

@inject('clientDataModel')
@observer
class App extends React.Component<Props> {
    public render(): React.ReactNode {
        if (this.props.clientDataModel!.globalData.forbidden) {
            return <ForbiddenPage/>;
        }

        return (
            <div className={b()}>
                {this.renderNavbar()}
                {this.renderPopup()}
                <div className={b('container')}>
                    {this.props.children}
                </div>
            </div>
        );
    }

    private renderNavbar(): React.ReactNode {
        return (
            <Navbar
                pages={[
                    {
                        path: '/bender-root',
                        icon: CLIPBOARD
                    },
                    {
                        path: '/bender-root/orders',
                        icon: WALLET
                    }
                ]}
                current={this.props.location.pathname}
                logo={{
                    path: '/bender-root',
                    src: '/public/imgs/admin/bender.png'
                }}
            />
        );
    }

    private renderPopup(): React.ReactNode {
        if (this.props.clientDataModel!.globalData.forbidden) {
            return;
        }

        return (
            <Popup
                show={this.props.clientDataModel!.globalProps.popupContent !== null}
                onClose={() => this.props.clientDataModel!.setPopupContent(null)}
            >
                {this.props.clientDataModel!.globalProps.popupContent}
            </Popup>
        );
    }
}

export default withRouter(App);
