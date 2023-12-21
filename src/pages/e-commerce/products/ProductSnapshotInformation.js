import React, {PureComponent} from 'react';
import IsEmpty from "../../../components/helpers/IsEmpty";
import Cookie from "js-cookie";
import {TinyMceContent} from "../../../components/helpers/TinyMceEditor";
import MyContext from "../../../components/MyContext";

// props: data
class ProductSnapshotInformation extends PureComponent {
    render() {
        let active = true;
        return (
            <MyContext.Consumer>{context => (
                <div className="">
                    <style jsx="true">{`
                    .nav-item a.active {
                        font-weight: bold;
                        color: ${context.theme_settings ? context.theme_settings.accent_color.value : ''} !important;
                        background-color: #FAFAFB !important;
                    }
                `}</style>
                    <ul className="nav nav-tabs" role="tablist">
                        {this.props.data.map((value, index, array) => {
                            let current_active = active;
                            if ((!IsEmpty(Cookie.get('language_code') !== '') ? (value.language_code === Cookie.get('language_code')) : (value.language_code === 'en'))) {
                                current_active = active;
                                active = false;
                            }
                            if (index === array.length - 1) active = true;
                            return (!IsEmpty(Cookie.get('language_code') !== '') ? (value.language_code === Cookie.get('language_code')) : (value.language_code === 'en')) &&
                                <li className="nav-item">
                                    <a
                                        className={`nav-link color-333333  ${current_active && 'active'}`}
                                        id={`section-tab${index}`}
                                        data-toggle="tab"
                                        href={`#section-${index}`}
                                        role="tab"
                                        aria-controls="home"
                                        aria-selected="true"
                                        style={{fontSize: '90%'}}
                                    >{value.sections.title}</a>
                                </li>;
                        })}
                    </ul>
                    <div className="tab-content">
                        {this.props.data.map((value, index, array) => {
                            let current_active = active;
                            if ((!IsEmpty(Cookie.get('language_code') !== '') ? (value.language_code === Cookie.get('language_code')) : (value.language_code === 'en'))) {
                                current_active = active;
                                active = false;
                            }
                            return (!IsEmpty(Cookie.get('language_code') !== '') ? (value.language_code === Cookie.get('language_code')) : (value.language_code === 'en')) &&
                                <div className={`tab-pane fade show ${current_active && 'active'}`} id={`section-${index}`} role="tabpanel" aria-labelledby={`section-tab${index}`}>
                                    <TinyMceContent className="mt-3">{value.sections.content}</TinyMceContent>
                                </div>;
                        })}
                    </div>
                </div>
            )}</MyContext.Consumer>
        );
    }
}

export default ProductSnapshotInformation;