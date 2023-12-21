import React, { useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import { Link } from "react-router-dom";
import $ from "jquery";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import Row from "../pages/cms/Row";

const Style = props => {
    return (
        <style>{`
            nav.navigation-${props.index} ul {
                display: ${(props.data && props.data.style && props.data.style.direction) ? (props.data.style.direction === "horizontal" ? "flex" : "block") : "flex"};
            }
            nav.navigation-${props.index} ul .main-menu-item-spacing {
                margin-${(props.data && props.data.style && props.data.style.direction) ? (props.data.style.direction === "horizontal" ? "left" : "top") : "left"}: ${(props.data && props.data.style && props.data.style.main_menu_item_spacing) ? props.data.style.main_menu_item_spacing : "1rem"};
            }
            nav.navigation-${props.index} ul li {
                text-decoration: none;
            }
            nav.navigation li:hover {
                cursor: pointer;
            }
            nav.navigation-${props.index} ul li ul {
                position: absolute;
                padding: 0;
                margin: 0;
                left: 0;
                display: none;
                z-index: 2000;
            }
            nav.navigation-${props.index} ul li ul li {
                ${(props.data && props.data.style && props.data.style.dropdown_background_color) ? `background-color: ${props.data.style.dropdown_background_color ? props.data.style.dropdown_background_color : 'rgba(255, 255, 255, 1)'};` : ''}
                ${(props.data && props.data.style && props.data.style.dropdown_box_shadow) ? (props.data.style.dropdown_box_shadow === "yes" ? "box-shadow: 0px 3px 5px -1px #ccc;" : '') : ''}
            }
            nav.navigation-${props.index} ul li ul li a {
                display: inline-block;
                padding: 0;
                text-decoration: none;
                ${(props.data && props.data.style && props.data.style.dropdown_font_size) ? `font-size: ${props.data.style.dropdown_font_size ? props.data.style.dropdown_font_size : 'medium'};` : ''}
                ${(props.data && props.data.style && props.data.style.dropdown_text_color) ? `color: ${props.data.style.dropdown_text_color ? props.data.style.dropdown_text_color : 'rgba(0, 0, 0, 1)'};` : ''}
            }
            nav.navigation-${props.index} ul li ul li a:hover {
                ${(props.data && props.data.style && props.data.style.dropdown_separator) ? (props.data.style.dropdown_separator === "yes" ? `
                    padding-left: 8px;
                    transition: all 0.3s ease;
                    border-left: 3px solid ${(props.data && props.data.style && props.data.style.dropdown_separator_color) ? props.data.style.dropdown_separator_color : "rgba(0, 0, 0, 1)"};` :
                "") : ""};
                ${(props.data && props.data.style && props.data.style.dropdown_text_hover_color) ? `color: ${props.data.style.dropdown_text_hover_color};` : ''};
                ${(props.data && props.data.style && props.data.style.dropdown_background_hover_color) ? `background-color: ${props.data.style.dropdown_background_hover_color};` : ''};
            }
            nav.navigation-${props.index} ul li:hover > ul {
                display: block;
            }
            nav.navigation-${props.index} ul li ul li {
                padding: ${(props.data && props.data.style && props.data.style.dropdown_item_spacing) ? props.data.style.dropdown_item_spacing : "10px"} 20px;
                white-space: nowrap;
            }
            nav.navigation-${props.index} ul li li:hover ul {
                position: absolute;
                top: 0;
                left: 100%;
                display: block;
            }
            nav.navigation-${props.index} a {
                text-decoration: none;
                padding: 0.25rem 0.5rem;
            }
            nav.navigation-${props.index} ul li a {
                transition: all 0.5s ease;
            }
            nav.navigation-${props.index} ul li a.main-menu {
                ${(props.data && props.data.style && props.data.style.font_weight) ? `font-weight: ${props.data.style.font_weight === 'semi_bold' ? '600' : props.data.style.font_weight};` : ''}
                ${(props.data && props.data.style && props.data.style.main_menu_font_size) ? `font-size: ${props.data.style.main_menu_font_size ? props.data.style.main_menu_font_size : 'medium'};` : ''}
                ${(props.data && props.data.style && props.data.style.main_menu_text_color) ? `color: ${props.data.style.main_menu_text_color ? props.data.style.main_menu_text_color : 'rgba(0, 0, 0, 1)'};` : ''}
            }
            nav.navigation-${props.index} ul li a.main-menu:hover {
                ${(props.data && props.data.style && props.data.style.main_menu_text_hover_color) ? `color: ${props.data.style.main_menu_text_hover_color};` : ''};
            }
            nav.navigation-${props.index} ul li a.main-menu:active {
                ${(props.data && props.data.style && props.data.style.main_menu_text_active_color) ? `color: ${props.data.style.main_menu_text_active_color};` : ''};
                ${(props.data && props.data.style && props.data.style.main_menu_text_active_line) ? (props.data.style.main_menu_text_active_line === "yes" ? `border-bottom: 1px solid ${(props.data && props.data.style && props.data.style.main_menu_text_active_line_color) ? props.data.style.main_menu_text_active_line_color : "rgba(0, 0, 0, 1)"};` : "") : 'rgba(0, 0, 0, 1)'};
                ${(props.data && props.data.style && props.data.style.main_menu_background_active_line) ? (props.data.style.main_menu_background_active_line === "yes" ? `background-color: ${(props.data && props.data.style && props.data.style.main_menu_background_active_line_color) ? props.data.style.main_menu_background_active_line_color : "rgba(0, 0, 0, 1)"};` : "") : 'rgba(0, 0, 0, 1)'};
            }
            nav.navigation-${props.index} #nav-menu-support-content {
                position: relative;
            }
            
            @media (max-width: 767.98px) {
                nav.navigation-${props.index} ul {
                    display: block;
                }
                nav.navigation-${props.index} ul .main-menu-item-spacing {
                    margin-left: 0;
                    ${(props.data && props.data.style && props.data.style.main_menu_item_spacing) ? `margin-top: ${props.data.style.main_menu_item_spacing};` : ''};
                }
                nav.navigation-${props.index} #nav-menu-support-content {
                    position: absolute;
                    top: ${props.top ? props.top : 0};
                    left: 0;
                    right: 0;
                    transform: translateY(100%);
                    text-align: left;
                    ${(props.data && props.data.style && props.data.style.dropdown_background_color) ? `background-color: ${props.data.style.dropdown_background_color};` : ''};
                    z-index: 2000;
                    padding: 12px;
                    background-color: #FFFFFF;
                }
            }            

            #nav-menu-support-content.collapsing {
                transition: none;
            }
        `}</style>
    );
}

const MegaMenu = props => {
    const [data, set_data] = useState([]);

    useEffect(() => {
        if (props.data && props.data.length > 0) {
            props.data.forEach(row => {
                row.columns.forEach(column => {
                    column.components.forEach(component => {
                        component.value = JSON.parse(component.value)
                    })
                    column.style = JSON.parse(column.style) || {}
                })
                row.style = JSON.parse(row.style) || {}
            });
        }
        set_data(props.data);
    }, []);

    return (
        <div>
            {(data && data.length > 0) && data.map((row) => (
                <Row key={row.id} type="mega_menu" row={row} />
            ))}
        </div>
    );
}

const SubNavigationMenuContent = ({ value, fontSize }) => {
    return (<>
        {value.icon &&
            <CustomImage folder={PublicStorageFolderPath.menu} filename={value.icon} alt={value.icon} className="mr-2" style={{ width: fontSize, height: fontSize }} />}
        {value.title}
        {(value.nav_menus && value.nav_menus.length) ? <i className="fas fa-angle-right ml-2" /> : ''}
        {(value.rows && value.rows.length) ? <i className="fas fa-angle-right ml-2" /> : ''}
    </>);
}

/**
 * 
 * @param {int} fontSize 
 * @param {object} data nav_menus children
 * @param {object} styles 
 * @param {bool} isMega 
 * @param {string} languageCode 
 * @returns 
 */
const SubNavigationMenu = (props) => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    return (
        <>
            <style>{`
                .div-div {
                    height: ${props.styles ? props.styles.flyover_margin : 0};
                }
                .div-adwa {
                    padding-top: ${props.styles ? props.styles.flyover_margin : 0};
                }
        
                @media (max-width: 767.98px) {
                    .div-div {
                        height: 10px;
                    }
                    .div-adwa {
                        padding-top: 0;
                    }
                }
            `}</style>
            {props.isMega ?
                <ul className="list-unstyled" style={{ width: props.styles.mega_menu_width || "100%" }}>
                    <div className="sticky-top div-div" />
                    <li className="w-100 h-100 overflow-auto position-relative p-0 m-0">
                        <div className="" style={{ backgroundColor: props.styles.primary_mega_menu_color, width: windowWidth <= 767 ? '100%' : '30%', height: props.styles.mega_menu_height || "15vw" }}>
                            {(props.data && props.data.length > 0) && props.data.map((value, index) => (
                                <span id={`hover-${value.id}`} className="my-2 pointer" style={{ color: props.styles.dropdown_text_color || "unset" }} key={value.id}>
                                    <style jsx="true">{`
                                    #content-hover-${value.id} {
                                        display: none;
                                    }
                                    #hover-${value.id}:hover > #text-hover-${value.id} {
                                        font-weight: bold;
                                    }
                                    #hover-${value.id}:hover > #content-hover-${value.id} {
                                        display: block;
                                    }
                                `}</style>
                                    <p id={`text-hover-${value.id}`} onClick={event => {
                                        if (document.getElementById(`content-hover-${value.id}`).style.display === 'block') {
                                            $(`#content-hover-${value.id}`).css('display', 'none');
                                        } else {
                                            $(`#content-hover-${value.id}`).css('display', 'block');
                                        }
                                    }} className={`px-3 m-0  ${index === 0 ? 'pt-2 pt-sm-2 pt-md-3 pt-lg-3 pt-xl-3 pb-2 pb-sm-2 pb-md-1 pb-lg-1 pb-xl-1' : 'py-2 py-sm-2 py-md-1 py-lg-1 py-xl-1'}`}>
                                        <a href="javascript:void(0)" className="text-white text-decoration-none" style={{ fontSize: props.data.font_size, fontWeight: props.data.font_weight }}>
                                            {value.icon &&
                                                <CustomImage folder={PublicStorageFolderPath.menu} filename={value.icon} alt={value.icon} className="mr-2" style={{ width: props.data.font_size, height: props.data.font_size }} />
                                            }{value.title}
                                        </a>
                                    </p>
                                    <div id={`content-hover-${value.id}`} className={`content-hover pb-3 h-100`} style={{
                                        backgroundColor: props.styles.secondary_mega_menu_color,
                                        left: windowWidth <= 767 ? 'auto' : '30%',
                                        right: windowWidth <= 767 ? 'auto' : 0,
                                        top: windowWidth <= 767 ? 'auto' : 0,
                                        bottom: windowWidth <= 767 ? 'auto' : 0,
                                        position: windowWidth <= 767 ? 'static' : 'absolute',
                                        overflowX: 'hidden',
                                        // overflowY: 'auto'
                                    }}>
                                        <MegaMenu data={value.rows} key={index} />
                                    </div>
                                </span>
                            ))}
                        </div>
                    </li>
                </ul> :
                <ul className="list-unstyled div-adwa mb-2">
                    {(props.data && props.data.length > 0) && props.data.map(value => (
                        <li key={value.id}>
                            {value.url_type === "internal" ?
                                <>
                                    {value.url.charAt(0) === '#' ?
                                        <a className="d-flex align-items-center" href={value.url}>
                                            <SubNavigationMenuContent value={value} fontSize={props.fontSize} />
                                        </a> :
                                        <Link className="d-flex align-items-center" data-toggle="collapse" data-target="#nav-menu-support-content" to={`/${props.languageCode}/${value.url}`}>
                                            <SubNavigationMenuContent value={value} fontSize={props.fontSize} />
                                        </Link>}
                                </>
                                :
                                <a className="d-flex align-items-center" href={value.url}>
                                    <SubNavigationMenuContent value={value} fontSize={props.fontSize} />
                                </a>
                            }
                            {value.nav_menus ? <SubNavigationMenu
                                fontSize={props.fontSize}
                                data={value.nav_menus}
                                styles={props.styles}
                                isMega={(value.nav_menus && value.nav_menus.length > 0) ? !!value.nav_menus.find(item => item.rows !== null) : false}
                                languageCode={props.languageCode}
                            /> : null}
                        </li>
                    ))}
                </ul>}
        </>
    );
}

/**
 *
 * @param {object} data data for this component
 */
const NavigationMenu = (props) => {
    const [data, set_data] = useState(null);

    useEffect(() => {
        getMenu();
    }, []);

    const getMenu = () => {
        let param = {
            cms_menu_id: props.data.cms_menu_id
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getMenuWithChildren`, Config({}, param)).then(response => {
            response.data.data.style = JSON.parse(response.data.data.style) || {};
            set_data(response.data.data);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    return (
        <nav className={`navigation-${props.data.cms_menu_id} navbar navbar-expand-lg navbar-light position-static p-0`}>
            <Style top={props.data.top} data={data} index={props.data.cms_menu_id} />
            <button className="navbar-toggler px-2" data-toggle="collapse" data-target="#nav-menu-support-content" aria-controls="nav-menu-support-content" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon" style={{ width: 20, height: 20 }} />
            </button>
            <div className="collapse navbar-collapse" id="nav-menu-support-content">
                <ul className="list-unstyled p-0 m-0">
                    {(data && data.nav_menus && data.nav_menus.length > 0) && data.nav_menus.map((value, index) => (
                        <li key={value.id} className={`${index === 0 ? '' : `main-menu-item-spacing`} ${(value.nav_menus && value.nav_menus.length > 0) ? value.nav_menus.find(item => item.rows !== null) ? 'position-static' : 'position-relative' : ''}`}>
                            {value.url_type === "internal" ?
                                <>
                                    {value.url.charAt(0) === '#' ?
                                        <a className="main-menu" href={value.url}>{value.icon && <CustomImage folder={PublicStorageFolderPath.menu} filename={value.icon} alt={value.icon} className="mr-2" style={{ width: props.data.font_size, height: props.data.font_size }} />}{value.title}</a> :
                                        <Link className="main-menu" data-toggle="collapse" data-target="#nav-menu-support-content" to={`/${data.language_code}/${value.url}`}>
                                            {value.icon && <CustomImage folder={PublicStorageFolderPath.menu} filename={value.icon} alt={value.icon} className="mr-2" style={{ width: props.data.font_size, height: props.data.font_size }} />}{value.title}
                                        </Link>}
                                </>
                                :
                                <a href={value.url} className="main-menu">{value.title}</a>
                            }
                            <SubNavigationMenu
                                fontSize={props.data.font_size}
                                data={value.nav_menus}
                                styles={data.style}
                                isMega={(value.nav_menus && value.nav_menus.length > 0) ? !!value.nav_menus.find(item => item.rows !== null) : false}
                                languageCode={data.language_code}
                            />
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
}

export default NavigationMenu