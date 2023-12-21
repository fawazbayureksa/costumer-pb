import React, { useEffect, useState } from "react";
import { Modal } from 'react-bootstrap'
import ImageLightbox from "./helpers/ImageLightbox";

/**
 * 
 * @param {object} data data for this component
 */
const Image = (props) => {
    const [style, set_style] = useState({})
    const [modal_show, set_modal_show] = useState(false)

    useEffect(() => {
        let styles = {
            maxHeight: props.data.max_height,
            maxWidth: props.data.max_width,
            width: props.data.width || 'auto',
            height: props.data.height || 'auto',
            borderRadius: props.data.rounded || 'auto',
        };
        if (props.data.border_type === 'border') {
            styles.borderTop = borderStyle(props.data.border_top);
            styles.borderRight = borderStyle(props.data.border_right);
            styles.borderBottom = borderStyle(props.data.border_bottom);
            styles.borderLeft = borderStyle(props.data.border_left);
        }
        set_style(styles);
    }, [])

    const borderStyle = size => {
        if (size) return `${size ? size : '0'} solid ${props.data.border_color}`;
        else return '';
    }

    const openModal = () => {
        if (props.data.lightbox === "on") {
            set_modal_show(true)
        }
    }
    const closeModal = () => {
        set_modal_show(false)
    }
    return (
        <>
            {props.data.redirect_link ?
                <a href={props.data.redirect_link} className="text-decoration-none">
                    <img src={props.data.src} alt={props.data.name} className="object-fit-cover" style={style} onClick={openModal} />
                </a> :
                <img src={props.data.src} alt={props.data.name} className="object-fit-cover" style={style} onClick={openModal} />}

            <ImageLightbox show={modal_show} onHide={closeModal} data={props.data} />
        </>
    )
}

export default Image