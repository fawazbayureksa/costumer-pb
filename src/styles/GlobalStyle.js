/**
 *
 * @param {string} themes global theme settings from database
 */
import { useEffect, useState } from "react";
import IsEmpty from "../components/helpers/IsEmpty";

const GlobalStyle = ({ themes }) => {
    const [windowWidth, setWindowWidth] = useState(0);

    useEffect(() => {
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    return (
        <style>{`
            h1{
                ${typographyTemplate(themes.h1_typography)}
            }
            h2{
                ${typographyTemplate(themes.h2_typography)}
            }
            h3{
                ${typographyTemplate(themes.h3_typography)}
            }
            h4{
                ${typographyTemplate(themes.h4_typography)}
            }
            h5{
                ${typographyTemplate(themes.h5_typography)}
            }
            h6{
                ${typographyTemplate(themes.h6_typography)}
            }
            body{
                ${typographyTemplate(themes.body_typography)}
            }
            a{
                color: ${themes.link_color.font_color || "unset"}
            }
            .accent-color {
                color: ${themes.accent_color.value} !important;
            }
            .bgc-accent-color {
                background-color: ${themes.accent_color.value} !important;
                color:  ${themes.accent_color?.text || "#FFFFFF"};
            }
            .border-accent-color {
                border: 1px solid ${themes.accent_color.value} !important;
            }
            .border-bottom-accent-color {
                border-bottom: 2px solid ${themes.accent_color.value} !important;
            }
            ${themes.responsive && themes.responsive.value === "off" ?
                `@media only screen and (min-width: 767.98px) {
                    .responsive-mode {
                        min-width: ${themes.site_width.width};
                    }
                }` :
                `@media only screen and (min-width: 767.98px) {
                    .responsive-mode {
                    }
                }`
            }
        `}</style>
    )
}

export default GlobalStyle


const typographyTemplate = (value) => {
    let width_of_window = window.innerWidth;
    let font_style = "normal";
    let font_weight = "400";

    if (value.font_weight_and_style) {
        if (value.font_weight_and_style.includes("italic")) font_style = "italic"

        let weight = /^\d+/.exec(value.font_weight_and_style)
        if (weight && weight.length > 0) font_weight = weight[0]
    }

    if (!value.font_family.includes(",")) {
        let url = 'https://fonts.googleapis.com/css2?family='

        url += (value.font_family.replace(/ /g, '+').replace(/'/g, ''));
        url += ":ital,wght@"

        if (font_style.includes("italic")) url += "1"
        else url += "0"

        url += "," + font_weight

        let link = document.createElement("link")
        link.setAttribute("rel", "stylesheet")
        link.setAttribute("type", "text/css")
        link.setAttribute("href", url)
        document.getElementsByTagName("head")[0].appendChild(link)
    }

    const getFontSize = () => {
        if (width_of_window <= 991.98) {
            if (IsEmpty(value.font_size)) {
                return `medium`;
            } else {
                return `calc(80 / 100 * ${value.font_size})`;
            }
        } else if (width_of_window >= 992 && width_of_window <= 1440) {
            if (IsEmpty(value.font_size)) {
                return `large`;
            } else {
                return value.font_size;
            }
        } else if (width_of_window >= 1441 && width_of_window <= 1920) {
            if (IsEmpty(value.font_size)) {
                return `xx-large`;
            } else {
                return `calc(130 / 100 * ${value.font_size})`;
            }
        } else {
            return `xx-large`;
        }
    }

    return `
        font-family: ${value.font_family ? `${value.font_family} ${value.backup_font_family ? "," + value.backup_font_family : ""}` : 'unset'};
        font-weight: ${font_weight};
        font-style: ${font_style};
        font-size: ${getFontSize()};
        letter-spacing: ${value.letter_spacing};
        line-height: ${value.line_height};
        color: ${value.font_color};
    `
}