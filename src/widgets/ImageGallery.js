import React, { useEffect, useState } from "react";
import ImageLightbox from "./helpers/ImageLightbox";

/**
 * 
 * @param {object} data data for this component
 */
const ImageGallery=(props)=>{
    const [style, set_style]= useState({})
    const [image_style, set_image_style]= useState({})
    const [modal_show, set_modal_show]= useState(false)
    const [selected, set_selected] = useState(null)
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(()=>{
        setStyle()
        setImageStyle()
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    },[])

    const setStyle=()=>{
        let style = {}

        if(props.data.layout === "grid"){
            style.display = "grid";
            style.gridTemplateColumns = `repeat(${windowWidth <= 575.98 ? 2 : (windowWidth >= 576 && windowWidth <= 767.98) ? 2 : (windowWidth >= 768 && windowWidth <= 991.98) ? 3 : props.data.number_of_column}, 1fr)`;
            style.gap = props.data.column_spacing
        }

        set_style(style)

    }
    
    const setImageStyle=async ()=>{
        let style = {
            maxWidth: '100%',
            alignSelf: 'center',
            justifySelf: 'center',
        }

        if(props.data.layout === "grid" && props.data.picture_size === "fixed"){
            let max_height = 0
            let max_width = 0
            for(const item of props.data.images){
                let img = await getImageProperties(item.src)
                
                if(max_height === 0) max_height = img.height
                else max_height = Math.min(max_height, img.height)
                
                if(max_width === 0) max_width = img.width
                else max_width = Math.min(max_width, img.width)
            }
            style.maxHeight = max_height
            style.height = "100%"
            // style.maxWidth = max_width
            style.width = "100%"
        }
        if(props.data.layout === "masonry"){
            style.margin = props.data.column_spacing
        }
        if (props.data.border_type === 'border') {
            style.borderTop = borderStyle(props.data.border_top);
            style.borderRight = borderStyle(props.data.border_right);
            style.borderBottom = borderStyle(props.data.border_bottom);
            style.borderLeft = borderStyle(props.data.border_left);
        }
        set_image_style(style)
    }

    const borderStyle = size => {
        if (size) return `${size ? size : '0'} solid ${props.data.border_color}`;
        else return '';
    }
    
    const getImageProperties = (src)=>{
        return new Promise((resolve,reject) => {
            let img = new Image();
            img.src = src
            img.onload = () =>{
                resolve(img)
            }
            img.onerror=(err)=>{
                console.log(err)
            }
        })
    }

    const openModal=(e)=>{
        let index = e.currentTarget.getAttribute('index')
        if(props.data.lightbox === "on"){
            set_modal_show(true)
            set_selected(props.data.images[index])
        }
    }
    const closeModal=()=>{
        set_modal_show(false)
    }
    return(
        <>
            {props.data.layout === "masonry" ?
                <div className="masonry--h d-flex w-100">
                    <style jsx="true">{`
                        .masonry--h {
                            flex-flow: row wrap;
                            margin-left: -${props.data.column_spacing || '8'}px; /* Adjustment for the gutter */
                        }
                        .masonry-brick--h {
                            flex: auto;
                            height: 250px;
                            min-width: 150px;
                            margin: 0 0 ${props.data.column_spacing || '8'}px ${props.data.column_spacing || '8'}px; /* Some gutter */
                        }
                        @media (min-width: 768px) {
                            .masonry-brick--h:nth-child(4n+1) {
                                width: 200px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+2) {
                                width: 250px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+3) {
                                width: 120px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+4) {
                                width: 280px;
                            }
                        }
                        @media (min-width: 992px) {
                            .masonry-brick--h:nth-child(4n+1) {
                                width: 250px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+2) {
                                width: 325px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+3) {
                                width: 180px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+4) {
                                width: 380px;
                            }
                        }
                        @media (min-width: 1024px) {
                            .masonry-brick--h:nth-child(4n+1) {
                                width: 100px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+2) {
                                width: 150px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+3) {
                                width: 150px;
                            }
                            .masonry-brick--h:nth-child(4n+1):nth-child(4n+4) {
                                width: 200px;
                            }
                        }
                    `}</style>
                    {props.data.images.map((item, index) => (
                        <figure className="masonry-brick--h overflow-hidden rounded" key={index}>
                            <img
                                key={item.id}
                                src={item.src}
                                alt={item.name}
                                className="object-fit-cover w-100 h-100"
                                onClick={openModal}
                                index={index}
                                style={{borderTop: style.borderTop || 'none', borderRight: style.borderRight || 'none', borderBottom: style.borderBottom || 'none', borderLeft: style.borderLeft || 'none'}}
                            />
                        </figure>
                    ))}
                </div> :
            <>
                {style && <div style={style}>
                    {props.data.images.map((item,index)=>(
                        <img key={item.id} src={item.src} alt={item.name} className="object-fit-cover" onClick={openModal} index={index} style={image_style} />
                    ))}
                </div>}
            </>}

            {selected && <ImageLightbox show={modal_show} onHide={closeModal} data={selected} />}
        </>
    )
}

export default ImageGallery