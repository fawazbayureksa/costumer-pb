import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import MetaTrigger from '../../../../../components/MetaTrigger';
import MyContext from '../../../../../components/MyContext';
import HistoryAuction from './HistoryAuction';
import OnGoingAuction from './OnGoingAuction';



const TabAuction = () => {
    const [key, setKey] = useState('new');

    const Style = (props) => {
        return (
            <style jsx="true">{`
                .nav-tabs .nav-link {
                    width: 45%;
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
                    text-align: center;
                }
                .nav-tabs .nav-link.active {
                    border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                    color:#F8931D;
                    font-weight:700;  
                    
                }
                .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                    font-weight:700;  
                }
                .nav-tabs a:hover {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                }
            `}</style>
        )
    }

    const { t } = useTranslation()
    return (
        <MyContext.Consumer>{context => (
            <div className="">
                <MetaTrigger
                    pageTitle={context.companyName ? `${t('account_setting.auction')} - ${context.companyName} ` : ""}
                    pageDesc={t('account_setting.auction')}
                />
                <Style themes={context.theme_settings} />
                <Tabs id="controlled-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="new" title='Sedang berlangsung'>
                        <OnGoingAuction />
                    </Tab>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="trend" title='Riwayat Lelang'>
                        <HistoryAuction />
                    </Tab>
                </Tabs>
            </div>
        )}</MyContext.Consumer>
    )
}
export default TabAuction;