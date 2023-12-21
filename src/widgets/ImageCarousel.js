import React, { useEffect, useState } from "react";
import { Modal } from 'react-bootstrap'
import ImageLightbox from "./helpers/ImageLightbox";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

/**
 * 
 * @param {object} data data for this component
 */
const ImageCarousel = (props) => {
    const [image_style, set_image_style] = useState({})
    const [modal_show, set_modal_show] = useState(false)
    const [selected, set_selected] = useState(null)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        setImageStyle();
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    const setImageStyle = async () => {
        let style = {
            maxWidth: '100%',
            margin: props.data.columns_spacing
        }

        if (props.data.picture_size === "fixed") {
            let max_height = 0
            let max_width = 0
            for (const item of props.data.images) {
                let img = await getImageProperties(item.src)

                if (max_height === 0) max_height = img.height
                else max_height = Math.min(max_height, img.height)
                if (max_width === 0) max_width = img.width
                else max_width = Math.min(max_width, img.width)
            }
            style.maxHeight = max_height
            style.height = "100%"
            style.maxWidth = max_width
            style.width = "100%"
        }
        if (props.data.border_type === 'border') {
            style.borderTop = borderStyle(props.data.border_top);
            style.borderRight = borderStyle(props.data.border_right);
            style.borderBottom = borderStyle(props.data.border_bottom);
            style.borderLeft = borderStyle(props.data.border_left);
        }
        if (props.data.padding_top) style.paddingTop = props.data.padding_top
        if (props.data.padding_right) style.paddingRight = props.data.padding_right
        if (props.data.padding_bottom) style.paddingBottom = props.data.padding_bottom
        if (props.data.padding_left) style.paddingLeft = props.data.padding_left
        console.log(props.data)
        console.log(style)
        set_image_style(style)
    }

    const borderStyle = size => {
        if (size) return `${size ? size : '0'} solid ${props.data.border_color}`;
        else return '';
    }

    const getImageProperties = (src) => {
        return new Promise((resolve, reject) => {
            let img = new Image();
            img.src = src
            img.onload = () => {
                resolve(img)
            }
            img.onerror = (err) => {
                console.log(err)
            }
        })
    }

    const openModal = (e) => {
        let index = e.currentTarget.getAttribute('index')
        if (props.data.lightbox === "on") {
            set_modal_show(true)
            set_selected(props.data.images[index])
        }
    }
    const closeModal = () => {
        set_modal_show(false)
    }

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: props.data.max_columns,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: props.data.max_columns,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: props.data.max_columns,
        }
    };
    return (
        <div>
            <style>{`
                .react-multi-carousel-list .card {
                    border: none;
                }
            `}</style>
            <Carousel responsive={responsive}
                arrows={props.data.show_navigation === "yes"}
                autoPlay={props.data.autoplay === "yes"}
                infinite={props.data.autoplay === "yes"}
                itemClass={`${props.data.picture_size === "fixed" ? "" : "place-self-center"}`}
            >
                {props.data.images.map((item, index) => (
                    <a href={item.url}>
                        <img
                            key={item.id}
                            src={item.src}
                            alt={item.name}
                            className="w-100 object-fit-cover"
                            onClick={openModal}
                            index={index}
                            style={image_style}
                            onError={event => event.target.src = `/images/placeholder.gif`}
                        />
                        {props.data.title == 'yes' && <p className="font-weight-semi-bold" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#FFFFFF' }}>{item.name}</p>}
                    </a>
                ))}
            </Carousel>

            {selected && <ImageLightbox show={modal_show} onHide={closeModal} data={selected} />}
        </div>
    )
}

export default ImageCarousel