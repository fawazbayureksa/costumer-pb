import React, { useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import $ from "jquery";
import IsEmpty from "../components/helpers/IsEmpty";

/**
 *
 * @param {object} data data for this component
 */
const Slider = (props) => {
    const [detail, set_detail] = useState(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        getSliderDetail();
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

    const getSliderDetail = () => {
        let param = {
            cms_slider_id: props.data.cms_slider_id,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getSlider`, Config({}, param)).then(response => {
            set_detail(response.data.data)
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

    return (<>
        {detail ?
            detail.type === 'type_1' ?
                <div id={`cms-carousel-${detail.id}`} className={`carousel slide`}
                    style={{ width: detail.width ? detail.width : 'auto', height: getHeight() }}
                    data-ride={detail.auto_play === "enable" ? "carousel" : "false"}
                    data-interval={detail.auto_play === "enable" ? detail.slideshow_speed : "false"}
                >
                    {detail.indicator !== 'none' &&
                        <ol className="carousel-indicators">
                            {detail.cms_slider_images.map((value, index) => (
                                <li key={value.id} data-target={`#cms-carousel-${detail.id}`} data-slide-to={index}
                                    className={index === 0 ? 'active' : ''} />
                            ))}
                        </ol>}
                    <div className="carousel-inner h-100">
                        {detail.cms_slider_images.map((value, index) => (
                            <div className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} key={value.id}>
                                <img
                                    src={value.filename}
                                    className="d-block w-100 h-100 object-fit-cover"
                                    alt={value.name}
                                    onError={event => event.target.src = `/images/placeholder.gif`}
                                />
                                <div className="carousel-caption d-none d-md-block">
                                    <h5 className="text-white">{value.title}</h5>
                                    <p className="text-white">{value.subtitle}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <a className="carousel-control-prev" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-prev-${detail.id}`} role="button"
                        data-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="sr-only">Previous</span>
                    </a>
                    <a className="carousel-control-next" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-next-${detail.id}`} role="button"
                        data-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="sr-only">Next</span>
                    </a>
                </div>
                : detail.type === 'type_2' ?
                    <div id={`cms-carousel-${detail.id}`} className={`carousel slide`}
                        style={{ width: detail.width ? detail.width : 'auto', height: getHeight() }}>
                        <style>{`
                        #cms-carousel-${detail.id} .carousel-item img {
                            border-radius: 1rem;
                            left: 50%;
                            transform: translateX(100%);
                        }
                    `}</style>
                        <div className="carousel-inner h-100 position-static">
                            {detail.cms_slider_images.map((value, index) => (
                                <div className={`carousel-item h-100 position-static ${index === 0 && 'active'}`}
                                    key={value.id}>
                                    <img
                                        src={value.filename}
                                        className="shadow-graph w-50 h-100 object-fit-cover"
                                        onError={event => event.target.src = `/images/placeholder.gif`}
                                        alt={value.name}
                                    />
                                    <div className="position-absolute" style={{ left: 0, right: 0, top: 0, bottom: 0 }}>
                                        <div className="row no-gutters h-100">
                                            <div className="col-4 d-flex align-items-center">
                                                <div className="">
                                                    <h4 className="mb-2 font-weight-bold">{value.title}</h4>
                                                    <p className="mb-2">{value.subtitle}</p>
                                                    <p className="mb-2 small">{value.desc}</p>
                                                    <a href={value.link}
                                                        className="bg-dark text-white rounded small px-3 py-1 font-weight-bold">See
                                                        Detail</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <a className="carousel-control-prev" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-prev-${detail.id}`} role="button"
                            data-slide="prev" style={{ width: '4rem', left: '50%' }}>
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="sr-only">Previous</span>
                        </a>
                        <a className="carousel-control-next" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-next-${detail.id}`} role="button"
                            data-slide="next" style={{ width: '4rem' }}>
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="sr-only">Next</span>
                        </a>
                    </div>
                    : detail.type === 'type_3' ?
                        <div id={`cms-carousel-${detail.id}`} className={`carousel slide`}
                            style={{ width: detail.width ? detail.width : 'auto', height: getHeight() }}>
                            <div className="carousel-inner h-100 position-static">
                                {detail.cms_slider_images.map((value, index) => (
                                    <div className={`carousel-item h-100 position-static ${index === 0 && 'active'}`}
                                        key={value.id}>
                                        <img
                                            src={value.filename}
                                            className="shadow-graph w-50 h-100 object-fit-cover"
                                            onError={event => event.target.src = `/images/placeholder.gif`}
                                            alt={value.name}
                                            style={{ borderRadius: '1rem' }}
                                        />
                                        <div className="position-absolute w-50"
                                            style={{ left: 'auto', right: 0, top: 0, bottom: 0 }}>
                                            <div className="d-flex align-items-center justify-content-end h-100 w-100">
                                                <div className="text-right">
                                                    <h4 className="mb-2 font-weight-bold">{value.title}</h4>
                                                    <p className="mb-2">{value.subtitle}</p>
                                                    <p className="mb-2 small">{value.desc}</p>
                                                    <a href={value.link}
                                                        className="bg-dark text-white rounded small px-3 py-1 font-weight-bold">See
                                                        Detail</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <a className="carousel-control-prev" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-prev-${detail.id}`} role="button"
                                data-slide="prev" style={{ width: '4rem' }}>
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="sr-only">Previous</span>
                            </a>
                            <a className="carousel-control-next" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-next-${detail.id}`} role="button"
                                data-slide="next" style={{ width: '4rem', right: '50%' }}>
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="sr-only">Next</span>
                            </a>
                        </div>
                        : <div id={`cms-carousel-${detail.id}`} className={`carousel slide`}
                            style={{ width: detail.width ? detail.width : 'auto', height: getHeight() }}>
                            {detail.indicator !== 'none' &&
                                <ol className="carousel-indicators">
                                    {detail.cms_slider_images.map((value, index) => (
                                        <li key={value.id} data-target={`#cms-carousel-${detail.id}`} data-slide-to={index}
                                            className={index === 0 ? 'active' : ''} />
                                    ))}
                                </ol>}
                            <div className="carousel-inner h-100">
                                {detail.cms_slider_images.map((value, index) => (
                                    <div className={`carousel-item h-100 ${index === 0 ? 'active' : ''}`} key={value.id}>
                                        <img
                                            src={value.filename}
                                            className="d-block w-100 h-100 object-fit-cover"
                                            alt={value.name}
                                            onError={event => event.target.src = `/images/placeholder.gif`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <a className="carousel-control-prev" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-prev-${detail.id}`} role="button"
                                data-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="sr-only">Previous</span>
                            </a>
                            <a className="carousel-control-next" href={`#cms-carousel-${detail.id}`} id={`cms-carousel-next-${detail.id}`} role="button"
                                data-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="sr-only">Next</span>
                            </a>
                        </div>
            : null
        }
    </>)
}

export default Slider
