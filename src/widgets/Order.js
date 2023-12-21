import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import EcommerceRoutePath from "../pages/e-commerce/EcommerceRoutePath";
import $ from "jquery";
import axios from "axios";
import Config from "../components/axios/Config";
import Cookie from "js-cookie";
import CustomerRoutePath from "../pages/e-commerce/customer/CustomerRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";

/**
 * 
 * @param {object} data data for this component
 */
const Order = (props) => {
    const [styles, set_styles] = useState({});
    const [counter, set_counter] = useState(0);

    useEffect(() => {
        setStyle();
        getCounter();
    }, []);

    const imgFit = () => {
        let size = $('.order-widget-text').css('font-size');
        $('.order-widget-text img').css({'width': size, 'height': size});
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

    const getCounter = () => {
        if(!JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)) return;
        
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cart/get-counter`, Config({
            Authorization: `Bearer ${Cookie.get('token')}`
        })).then(response => {
            set_counter(response.data.data);
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    return (
        <>
            <style>{`
                .order-widget-text {
                    font-size: ${props.data.font_size};
                }
                .badge-counter {
                    margin-left: -1.2em;
                    margin-top: -0.3em;
                }
                @media (max-width: 765.98px) {
                    .order-widget-text {
                        font-size: 100%;
                    }
                    .badge-counter {
                        margin-left: -1.6em;
                    }
                }
            `}</style>
            <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} className="text-decoration-none position-relative d-flex align-items-center order-widget-text" style={styles}>
                {props.data.logo && props.data.logo_position === 'left' &&
                <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover mr-1" style={{width: 30, height: 30}}/>}
                {props.data.text}
                {props.data.logo && props.data.logo_position === 'right' &&
                <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.logo} alt={props.data.logo} className="object-fit-cover ml-1" style={{width: 30, height: 30}}/>}
                {props.data.with_counter === 'yes' &&
                <div className={`${counter > 0 ? '' : 'd-none'} d-flex align-self-start`}>
                    <span className="badge badge-pill badge-counter bgc-EB2424"  >
                        <p className="m-0 small text-white">{counter > 99 ? '99+' : counter}</p>
                    </span>
                </div>}
            </Link>
        </>
    );
}

export default Order