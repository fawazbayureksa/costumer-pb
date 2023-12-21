import React from "react";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";

/**
 * 
 * @param {object} data data for this component
 */
const Icon = (props) => {
    const style = {
        maxHeight: props.data.max_height,
        maxWidth: props.data.max_width,
        height: props.data.height,
        width: props.data.width,
    }

    const inner = () => (<div className="text-center">
        <CustomImage folder={PublicStorageFolderPath.cms} filename={props.data.image} alt={props.data.image} className="object-fit-cover" style={style} />
        <p className="m-0">{props.data.text}</p>
    </div>)

    return (
        <>
            {props.data.redirect_link ?
                <a href={props.data.redirect_link} className="text-decoration-none">
                    {inner()}
                </a> :
                inner()
            }
        </>
    )
}

export default Icon