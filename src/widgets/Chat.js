import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import EcommerceRoutePath from "../pages/e-commerce/EcommerceRoutePath";
import { WebsocketContext } from "../components/websocket/WebsocketHelper"
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import { OverlayTrigger, Popover } from "react-bootstrap";
import IsEmpty from "../components/helpers/IsEmpty";
import { useTranslation } from "react-i18next";

/**
 * 
 * @param {object} data data for this component
 */
const Chat = (props) => {
    const [styles, set_styles] = useState({});
    const [counter, set_counter] = useState(0);
    const websocketContext = useContext(WebsocketContext)

    useEffect(() => {
        setStyle();
    }, []);

    useEffect(() => {
        set_counter(websocketContext.unread)
    }, [websocketContext])

    const imgFit = () => {
        let size = $('.chat-widget-text').css('font-size');
        $('.chat-widget-text img').css({ 'width': size, 'height': size });
    }

    const setStyle = () => {
        let temp_styles = {};
        if (props.data.font_weight) {
            temp_styles.fontWeight = props.data.font_weight === 'semi_bold' ? 600 : props.data.font_weight
        }
        if (props.data.color) {
            temp_styles.color = props.data.color
        }
        temp_styles.marginTop = props.data.margin_top || 0;
        temp_styles.marginBottom = props.data.margin_bottom || 0;
        temp_styles.marginRight = props.data.margin_right || 0;
        temp_styles.marginLeft = props.data.margin_left || 0;
        set_styles(temp_styles);
    }

    const { t } = useTranslation()

    return (
        <>
            <style>{`
                .chat-widget-text {
                    font-size: ${props.data.font_size};
                }
                .badge-counter {
                    margin-left: -1.2em;
                    margin-top: -0.3em;
                }
                @media (max-width: 765.98px) {
                    .chat-widget-text {
                        font-size: 100%;
                    }
                    .badge-counter {
                        margin-left: -1.6em;
                    }
                }
            `}</style>
            {props.data.with_dropdown === "no" &&
                <Link to={EcommerceRoutePath.CHAT} className="text-decoration-none position-relative d-flex align-items-center chat-widget-text" style={styles}>
                    {props.data.logo && props.data.logo_position === 'left' &&
                        <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover mr-1" style={{ width: 30, height: 30 }} />}
                    {props.data.text}
                    {props.data.logo && props.data.logo_position === 'right' &&
                        <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover ml-1" style={{ width: 30, height: 30 }} />}
                    {props.data.with_counter === 'yes' &&
                        <div className={`${counter > 0 ? '' : 'd-none'} d-flex align-self-start`}>
                            <span className="badge badge-pill badge-counter bgc-EB2424"  >
                                <p className="m-0 small text-white">{counter > 99 ? '99+' : counter}</p>
                            </span>
                        </div>}
                </Link>
            }
            {props.data.with_dropdown === "yes" &&
                <OverlayTrigger
                    trigger='click'
                    key={'bottom'}
                    placement={'bottom'}
                    rootClose
                    overlay={
                        <Popover id={`popover-positioned-${'bottom'}`}>
                            <Popover.Content>
                                <div className="px-3 py-1">
                                    {props.data.dropdown && props.data.dropdown.map((value, index) => {
                                        if (value.is_enabled && value.type === 'personal_chat') {
                                            return (
                                                <p className={`mb-0 mt-2`}>
                                                    <Link to={EcommerceRoutePath.CHAT} className="color-333333">{value.text}</Link>
                                                </p>
                                            )
                                        } else if (value.is_enabled && value.type === 'help_center') {
                                            return (
                                                <p className={`mb-0 mt-2`}>
                                                    <Link to={EcommerceRoutePath.RESOLUTION_CENTER} className="color-333333">{value.text}</Link>
                                                </p>
                                            )
                                        }
                                    })}
                                    {(props.data.dropdown && IsEmpty(props.data.dropdown.find(value => value.type === 'personal_chat'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={EcommerceRoutePath.CHAT} className="color-333333">{t('account_setting.personal_chat')}</Link>
                                        </p>
                                    }
                                    {(props.data.dropdown && IsEmpty(props.data.dropdown.find(value => value.type === 'help_center'))) &&
                                        <p className={`mb-0 mt-2`}>
                                            <Link to={EcommerceRoutePath.RESOLUTION_CENTER} className="color-333333">{t('account_setting.help_center')}</Link>
                                        </p>
                                    }
                                </div>
                            </Popover.Content>
                        </Popover>
                    }
                >
                    <div className="text-decoration-none position-relative d-flex align-items-center chat-widget-text" style={styles}>
                        {props.data.logo && props.data.logo_position === 'left' &&
                            <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover mr-1" style={{ width: 30, height: 30 }} />}
                        {props.data.text}
                        {props.data.logo && props.data.logo_position === 'right' &&
                            <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover ml-1" style={{ width: 30, height: 30 }} />}
                        {props.data.with_counter === 'yes' &&
                            <div className={`${counter > 0 ? '' : 'd-none'} d-flex align-self-start`}>
                                <span className="badge badge-pill badge-counter bgc-EB2424"  >
                                    <p className="m-0 small text-white">{counter > 99 ? '99+' : counter}</p>
                                </span>
                            </div>
                        }
                    </div>
                </OverlayTrigger>
            }
        </>
    );
}

export default Chat