import React from "react";
import { TinyMceContent } from "../components/helpers/TinyMceEditor";

/**
 * 
 * @param {object} data data for this component
 */
const Separator = (props) => {
    const getBorderWidth = () => {
        if (props.data.type === 'single_border_solid' || props.data.type === 'single_border_dashed' || props.data.type === 'single_border_dotted') return `${props.data.size}px 0 0 0`;
        else if (props.data.type === 'double_border_solid' || props.data.type === 'double_border_dashed' || props.data.type === 'double_border_dotted') return `${props.data.size}px 0`;
        else return `${props.data.size}px 0`;
    }

    const getBorderStyle = () => {
        if (props.data.type === 'single_border_solid' || props.data.type === 'double_border_solid') return 'solid';
        else if (props.data.type === 'single_border_dashed' || props.data.type === 'double_border_dashed') return 'dashed';
        else if (props.data.type === 'single_border_dotted' || props.data.type === 'double_border_dotted') return 'dotted';
        else return 'none';
    }

    return (
        <div style={{
            borderWidth: getBorderWidth(),
            borderStyle: getBorderStyle(),
            borderColor: props.data.color,
            width: props.data.width || '100%',
            height: props.data.height || 0,
            marginTop: props.data.margin_top || 0,
            marginRight: props.data.margin_right || 0,
            marginBottom: props.data.margin_bottom || 0,
            marginLeft: props.data.margin_left || 0,
        }}/>
    );
}

export default Separator