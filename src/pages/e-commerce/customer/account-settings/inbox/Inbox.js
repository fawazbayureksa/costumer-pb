import React, { useEffect, useState } from 'react';
import { withTranslation } from "react-i18next";
import { Tabs, Tab } from "react-bootstrap";

import All from "./All";
import Information from "./Information";
import Promo from "./Promo";
import MyContext from "../../../../../components/MyContext";
import MetaTrigger from '../../../../../components/MetaTrigger';

const Inbox = (props) => {
    const [key, setKey] = useState('all');

    const Style = () => {
        return (
            <style jsx="true">{`
                .nav-tabs .nav-link {
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
                }
                .nav-tabs .nav-link.active {
                    border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                }
                .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                    font-weight: 500;
                }
                .nav-tabs a:hover {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                }
            `}</style>
        )
    }

    const { t } = props;
    return (
        <MyContext.Consumer>{context => (
            <>
                <MetaTrigger
                    pageTitle={context.companyName ? `${t('account_setting.inbox')} - ${context.companyName} ` : ""}
                    pageDesc={t('account_setting.inbox')}
                />
                <Style themes={context.theme_settings} />
                <div className="bg-white shadow-graph rounded p-3">
                    <Tabs id="controlled-tab" className="h-100" activeKey={key} onSelect={(k) => setKey(k)}>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-lg-4 mx-xl-4 " eventKey="all" title={t('inbox.all')}>
                            <All />
                        </Tab>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-lg-4 mx-xl-4 " eventKey="information" title={t('inbox.information')}>
                            <Information />
                        </Tab>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-lg-4 mx-xl-4 " eventKey="promo" title={t('inbox.promo')}>
                            <Promo />
                        </Tab>
                    </Tabs>
                </div>
            </>
        )}</MyContext.Consumer>
    )
}

export default withTranslation()(Inbox)