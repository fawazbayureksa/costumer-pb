
import React from "react";
import { TinyMceContent } from "../components/helpers/TinyMceEditor";

/**
 * 
 * @param {object} data data for this component
 */
const Notice=(props)=>{
    return(
        <div className={`d-flex overflow-hidden rounded p-2 align-items-baseline ${props.data.type === 'general' ? 'bg-info' : props.data.type === 'warning' ? 'bg-warning' : 'bg-transparent'}`}>
            <i className="fas fa-exclamation-circle color-374650 mr-3" />
            <TinyMceContent>{props.data.content}</TinyMceContent>
        </div>
    )
}

export default Notice
