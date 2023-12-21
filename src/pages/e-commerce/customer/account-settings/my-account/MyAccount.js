import React, { useState } from 'react';
import { withTranslation } from "react-i18next";
import { Tabs, Tab } from "react-bootstrap";

import PersonalProfile from './PersonalProfile';
import MyContext from "../../../../../components/MyContext";

const MyAccount = (props) => {
    const [key, setKey] = useState('profile_setting');

    const { t } = props;
    return (
        <MyContext.Consumer>{context => (
            <>
                <style jsx="true">{`
                    .nav-tabs .nav-link {
                        border: none;
                        margin-left : 2rem;
                        margin-right: 2rem;
                    }
                    .nav-tabs .nav-link.active {
                        border-bottom: 2px solid ${context.theme_settings ? context.theme_settings.accent_color.value : ''};
                    }
                    .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                        color: ${context.theme_settings ? context.theme_settings.accent_color.value : ''};
                        font-weight: 500;
                    }
                    .nav-tabs a{
                        font-size: 14px;
                    }
                    .nav-tabs a:hover {
                        color: ${context.theme_settings ? context.theme_settings.accent_color.value : ''};
                    }
                `}</style>
                <div className="bg-white shadow-graph rounded p-3">
                    <Tabs id="controlled-tab" className="h-100" activeKey={key} onSelect={(k) => setKey(k)}>
                        <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-lg-4 mx-xl-4 " eventKey="profile_setting" title={t('my_account.profile_setting')}>
                            <PersonalProfile />
                        </Tab>
                        {/* <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-lg-4 mx-xl-4 " eventKey="notification" title={t('my_account.notification')}>
                        <Notification/>
                    </Tab> */}
                    </Tabs>
                </div>
            </>
        )}</MyContext.Consumer>
    )
}

export default withTranslation()(MyAccount)