import React from "react";
import { TinyMceContent } from "../components/helpers/TinyMceEditor";

/**
 * 
 * @param {object} data data for this component
 */
const TextEditor=(props)=>{
    return(
        <TinyMceContent>{props.data.value}</TinyMceContent>
    )
}

export default TextEditor