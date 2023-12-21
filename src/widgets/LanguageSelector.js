import React, { useEffect, useState } from "react";
import Cookie from 'js-cookie';
import { Link, useHistory } from "react-router-dom";
import { OverlayTrigger, Popover } from "react-bootstrap";
import axios from "axios";
import Config from "../components/axios/Config";

/**
 * 
 * @param {object} data data for this component
 */
const LanguageSelector = (props) => {
    const history = useHistory()
    const [name, set_name] = useState('')
    const [languages, set_languages] = useState([])
    const [style, set_style] = useState({});

    const changeLanguage = (language) => {
        Cookie.set('language_code', language.language_code);
        set_name(language.language.name)
        window.location.href = `/${language.language_code}`;
    };

    useEffect(() => {
        getAvailableLanguages();
        setStyle();
    }, []);

    const setStyle = () => {
        let styles = {};
        if (props.data.text_align) {
            styles.textAlign = props.data.text_align
        }
        if (props.data.font_weight) {
            styles.fontWeight = props.data.font_weight === 'semi_bold' ? 600 : props.data.font_weight
        }
        if (props.data.font_color) {
            styles.color = props.data.font_color
        }
        styles.marginTop = props.data.margin_top || 0;
        styles.marginBottom = props.data.margin_bottom || 0;
        styles.marginRight = props.data.margin_right || 0;
        styles.marginLeft = props.data.margin_left || 0;
        set_style(styles);
    }

    const getAvailableLanguages = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getAvailableLanguages`, Config()).then(response => {
            set_languages(response.data.data)

            let selected = response.data.data.find(x => x.language_code === Cookie.get("language_code"))
            if (selected) set_name(selected.language.name)
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    return (
        <>
            <style>{`
                #text-language {
                    font-size: ${props.data.font_size};
                }
                @media (max-width: 765.98px) {
                    #text-language {
                        font-size: 100%;
                    }
                }
            `}</style>
            {languages.length > 0 &&
                <div className={`d-flex align-items-center ${style.textAlign === 'center' ? 'justify-content-center' : style.textAlign === 'right' ? 'justify-content-end' : ''}`}>
                    <p id="text-language" className="" style={style}>{name}</p>
                    <div className="border rounded-circle d-flex align-items-center justify-content-center ml-2" style={{ width: '.8rem', height: '.8rem' }}>
                        <OverlayTrigger
                            trigger="click"
                            key={'bottom'}
                            placement={'bottom'}
                            rootClose
                            overlay={
                                <Popover id={`popover-positioned-${'bottom'}`}>
                                    <Popover.Content>
                                        <div className="px-2 py-1 text-left">
                                            {languages.map((value, index) => (
                                                <div className={index > 0 ? 'mt-2' : ''} key={value.id}>
                                                    <a href="#" className="color-0D2840" value={value.language_code} onClick={() => changeLanguage(value)}>{value.language.name}</a>
                                                </div>
                                            ))}
                                        </div>
                                    </Popover.Content>
                                </Popover>
                            }
                        >
                            <a href="#"><i className="fas fa-chevron-down color-0D2840" style={{ fontSize: '.6rem' }}></i></a>
                        </OverlayTrigger>
                    </div>
                </div>}
        </>
    );
}

export default LanguageSelector
