import React, { useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import IsEmpty from "../components/helpers/IsEmpty";
import { TinyMceContent } from "../components/helpers/TinyMceEditor";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import $ from "jquery";
import CustomVideo from "../components/helpers/CustomVideo";

/**
 *
 * @param {object} data data for this component
 */
const AdvancedSlider = (props) => {
    const [detail, set_detail] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        getAdvancedSliderDetail();
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    useEffect(() => {
        if (!detail) return;

        if (detail.auto_play === "yes") setTimeout(() => {
            $(`#cms-carousel-next-${detail.id}`).trigger("click");
        }, detail.slideshow_speed || 3000);
    }, [detail])

    const getAdvancedSliderDetail = () => {
        let param = {
            cms_advanced_slider_id: props.data.cms_advanced_slider_id,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getAdvancedSlider`, Config({}, param)).then(response => {
            set_detail(response.data.data);
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    const getHeight = () => {
        if (IsEmpty(detail.height)) return 'auto';
        if (windowWidth <= 575.98) {
            return `calc(60 / 100 * ${detail.height})`;
        } else if (windowWidth >= 576 && windowWidth <= 767.98) {
            return `calc(60 / 100 * ${detail.height})`;
        } else if (windowWidth >= 768 && windowWidth <= 991.98) {
            return `calc(60 / 100 * ${detail.height})`;
        } else {
            return detail.height;
        }
    }

    const getYoutubeSrc = (setting) => {
        let url = `https://www.youtube.com/embed/${setting.youtube_code}`
        url += `?autoplay=${setting.autoplay === "yes" ? 1 : 0}`
        url += `&loop=${setting.loop === "yes" ? 1 : 0}`
        if (setting.loop === "yes") url += `&playlist=${setting.youtube_code}`
        url += `&mute=${setting.mute === "yes" ? 1 : 0}`
        url += `&controls=${setting.autoplay === "yes" ? 0 : 1}`
        return url
    }

    const getVerticalAlignment = (vertical_content_alignment) => {
        if (vertical_content_alignment === "top") return "align-items-start"
        else if (vertical_content_alignment === "center") return "align-items-center"
        else if (vertical_content_alignment === "bottom") return "align-items-end"
        else if (vertical_content_alignment === "stretch") return "align-items-stretch"
        else return ""
    }

    const getHorizontalAlignment = (horizontal_content_alignment) => {
        if (horizontal_content_alignment === "left") return "justify-content-start"
        else if (horizontal_content_alignment === "center") return "justify-content-center"
        else if (horizontal_content_alignment === "right") return "justify-content-end"
        else return ""
    }

    return (<>
        {detail ?
            detail.type === 'type_1' ?
                <div
                    id={`cms-carousel-${detail.id}`}
                    className="carousel slide"
                    style={{
                        width: detail.width ? detail.width : 'auto',
                        height: getHeight(),
                        minHeight: detail.min_height ? detail.min_height : 'auto'
                    }}
                    data-ride={detail.auto_play === "yes" ? "carousel" : "false"}
                    data-interval={detail.auto_play === "yes" ? detail.slideshow_speed : "false"}
                >
                    {detail.indicator !== 'none' &&
                        <ol className="carousel-indicators">
                            {detail.cms_advanced_slider_slides.map((value, index, array) => (
                                <li key={value.id} data-target={`#cms-carousel-${detail.id}`}
                                    data-slide-to={index} className={index === 0 ? 'active' : ''} />
                            ))}
                        </ol>}
                    <div className="carousel-inner h-100">
                        {detail.cms_advanced_slider_slides.map((value, index, array) => {
                            let setting = JSON.parse(value.setting) || {};
                            let aspectRatio = setting.aspect_ratio ? setting.aspect_ratio.split(":") : [];
                            let contentSlide = <div
                                className={`adv-sli-${value.id} d-flex ${getHorizontalAlignment(value.horizontal_content_alignment)} ${getVerticalAlignment(value.vertical_content_alignment)}`}>
                                <style>{`
                                    .adv-sli-${value.id} {
                                        height: ${detail.height ? detail.height : "100%"};
                                        ${setting.background_overlay === "yes" ? (setting.background_overlay_type === "color" ?
                                        `background-color: ${setting.background_overlay_color ? setting.background_overlay_color : 'unset'};` :
                                        setting.background_overlay_type === "gradient" ?
                                            `background: ${setting.background_overlay_gradient_type}-gradient(${setting.background_overlay_gradient_type === 'linear' ? `${setting.background_overlay_gradient_angle}deg` : `circle`}, ${setting.background_overlay_gradient_start_color} ${setting.background_overlay_gradient_start_position}%, ${setting.background_overlay_gradient_end_color} ${setting.background_overlay_gradient_end_position}%);` : "") : ""}
                                        
                                        text-shadow: ${value.content_text_effect === "none" ? "none" : value.content_text_effect === "shadow" ? "0 3px 6px #00000029" : "none"};
                                    }
                                `}</style>
                                <div className="d-flex" style={{ width: "min-content", whiteSpace: "nowrap" }}>
                                    <TinyMceContent>{value.content}</TinyMceContent>
                                </div>
                            </div>;
                            let slideComponent = <>
                                {value.type === "image" ?
                                    <div className="position-relative w-100 h-100">
                                        <CustomImage
                                            filename={setting.background_image}
                                            folder={PublicStorageFolderPath.cms}
                                            className="w-100 h-100"
                                        />
                                        <div className="position-absolute" style={{
                                            inset: 0,
                                            zIndex: 2
                                        }}>{contentSlide}</div>
                                    </div> :
                                    value.type === "video" || "youtube" ?
                                        <div className="position-relative w-100 h-100" style={{
                                            paddingTop: aspectRatio.length === 2 ? `${parseInt(aspectRatio[1]) / parseInt(aspectRatio[0]) * 100}%` : value.type === "youtube" ? `${9 / 16 * 100}%` : "unset"
                                        }}>
                                            {value.type === "video" ?
                                                <CustomVideo
                                                    className={`${aspectRatio.length === 2 ? "position-absolute" : ""} w-100 h-100 object-fit-fill`}
                                                    style={{
                                                        inset: 0,
                                                        zIndex: 1
                                                    }}
                                                    autoplay={setting.autoplay === "yes"}
                                                    loop={setting.loop === "yes"}
                                                    muted={setting.autoplay === "yes" || setting.mute === "yes"}
                                                    controls={setting.autoplay !== "yes"}
                                                    filename={setting.background_video}
                                                    folder={PublicStorageFolderPath.cms}
                                                /> :
                                                <iframe
                                                    className="position-absolute w-100 h-100"
                                                    style={{
                                                        inset: 0,
                                                        zIndex: 1
                                                    }}
                                                    src={getYoutubeSrc(setting)}
                                                    title="YouTube video player"
                                                    frameBorder="0" />
                                            }
                                            <div className="position-absolute" style={{
                                                inset: 0,
                                                zIndex: 2
                                            }}>{contentSlide}</div>
                                        </div> : ""}
                            </>
                            return (
                                value.link === "" ?
                                    <div
                                        className={`carousel-item h-100 ${index === 0 ? 'active' : ''} parent-adv-sli-${value.id}`}
                                        key={value.id}
                                    >{slideComponent}</div> :
                                    <a
                                        className={`carousel-item h-100 ${index === 0 ? 'active' : ''} parent-adv-sli-${value.id}`}
                                        key={value.id}
                                        href={value.link}
                                        target="_blank"
                                        style={{ color: "inherit" }}
                                    >{slideComponent}</a>
                            )
                        })}
                    </div>
                    <a className="carousel-control-prev" href={`#cms-carousel-${detail.id}`}
                        id={`cms-carousel-prev-${detail.id}`}
                        role="button" data-slide="prev" style={{ zIndex: 3 }}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="sr-only">Previous</span>
                    </a>
                    <a className="carousel-control-next" href={`#cms-carousel-${detail.id}`}
                        id={`cms-carousel-next-${detail.id}`}
                        role="button" data-slide="next" style={{ zIndex: 3 }}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="sr-only">Next</span>
                    </a>
                </div>
                : null
            : null
        }
    </>)
}

export default AdvancedSlider;