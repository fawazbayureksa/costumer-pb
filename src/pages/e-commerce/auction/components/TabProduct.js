import React, { useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import MyContext from '../../../../components/MyContext';
import AboutProduct from '../auction-detail/AboutProduct';

const TabProduct = ({ data }) => {
    const [key, setKey] = useState('new');

    const Style = (props) => {
        return (
            <style jsx="true">{`
                .nav-tabs .nav-link {
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
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
            <>
                <Style themes={context.theme_settings} />
                <Tabs id="controlled-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="new" title="Tentang Produk">
                        <AboutProduct item={data} />
                    </Tab>
                    <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="trend" title="Cara Pemakaian">
                    </Tab>
                </Tabs>
            </>
        )}</MyContext.Consumer>
    )
}
export default TabProduct;