import React from "react";

/**
 * 
 * @param {object} data data for this component
 * @param {string} type link or submit (form)
 */
const Button = (props) => {
    const innerButton=()=>(
        <button style={{
            width: props.data.width,
            height: props.data.height,
            color: props.data.color,
            backgroundColor: props.data.background_color,
            boxShadow: props.data.box_shadow,
            borderRadius: props.data.border_radius,
            fontSize: props.data.font_size,
            fontWeight: props.data.font_weight,
            borderColor: props.data.border_color,
            borderWidth: props.data.border_width,
            marginTop: props.data.margin_top,
            marginRight: props.data.margin_right,
            marginBottom: props.data.margin_bottom,
            marginLeft: props.data.margin_left,
            paddingTop: props.data.padding_top,
            paddingRight: props.data.padding_right,
            paddingBottom: props.data.padding_bottom,
            paddingLeft: props.data.padding_left,
        }}>
            {props.data.text}
        </button>
    )

    if(props.type === "link") return (
        <a href={props.data.url} target={props.data.target}>
            {innerButton()}  
        </a>
    )
    else if(props.type === "submit") return(
        <>
            {innerButton()}
        </>
    )
    else return null
}

export default Button