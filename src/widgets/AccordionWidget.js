import React from "react";
import { TinyMceContent, TinyMcePreview } from "../components/helpers/TinyMceEditor";

/**
 * 
 * @param {object} data data for this component
 */
const AccordionWidget = (props) => {
    return (
        <>
            <style>{`
            .card {
                margin: ${props.data.item_spacing} 0;
            }
            .card-body {
                ${props.data.icon_alignment == "right" ? `padding: 0.75rem 0.25rem;` : `padding: 0.75rem 1.25rem;`}
            }
            ${props.data.boxed == "yes" ?
                    `.card {
                    border: ${props.data.border_width}px solid ${props.data.border_color};
                }
                .card-header {
                    border: ${props.data.border_width}px solid ${props.data.border_color};
                    background-color: ${props.data.background_color}; 
                }
                .card-header:hover {
                    background-color: ${props.data.background_hover_color}; 
                }` :
                    `.card {
                    ${props.data.divider_line == "yes" ?
                        `border-bottom: ${props.data.divider_width_size}px solid ${props.data.divider_color};
                        border-radius: 0px;
                        border-top: none;
                        border-left: none;
                        border-right: none;` :
                        `border: none;`
                    }
                }
                .card-header {
                    border: none;
                    background: none;
                }`
                }
            .title {
                font-size: ${props.data.title_size};
                color: ${props.data.title_color}
            }
            .icon img {
                width: ${props.data.icon_size};
                height: ${props.data.icon_size};
                color: ${props.data.icon_color};
            }
            .title:hover {
                color: ${props.data.item_hover_accent_color}
            }
            .icon:hover {
                color: ${props.data.item_hover_accent_color}
            }
            [aria-expanded=true] .open {
                display: none;
            }
            [aria-expanded=false] .close {
                display: none;
            }
        `}</style>
            <div id={props.data.type == "toggle" ? "" : "accordion-" + props.id}>
                {props.data.items.map((item, index) => (
                    <div className="card">
                        <div className="card-header" id={"heading-" + props.id + "-" + index} data-toggle="collapse" data-target={"#collapse-" + props.id + "-" + index} aria-expanded={item.open_by_default === "yes" && "true"} aria-controls={"collapse-" + props.id + "-" + index}>
                            <div className="row align-items-center">
                                {props.data.icon_alignment == "left" && <>
                                    {props.data.icon === "yes" && <>
                                        <div className="mr-2 icon close">
                                            <img src={`/images/accordion/${props.data.item_open_icon}`} />
                                        </div>
                                        <div className="mr-2 icon open">
                                            <img src={`/images/accordion/${props.data.item_close_icon}`} />
                                        </div>
                                    </>
                                    }
                                </>}

                                <div className="title">{item.title}</div>
                                {props.data.icon_alignment == "right" && <>
                                    {props.data.icon === "yes" && <>
                                        <div className="ml-auto icon close">
                                            <img src={`/images/accordion/${props.data.item_open_icon}`} />
                                        </div>
                                        <div className="ml-auto icon open">
                                            <img src={`/images/accordion/${props.data.item_close_icon}`} />
                                        </div>
                                    </>}
                                </>}
                            </div>
                        </div>

                        <div id={"collapse-" + props.id + "-" + index} className={`collapse ${item.open_by_default == "yes" && "show"}`} aria-labelledby={"heading-" + props.id + "-" + index} data-parent={props.data.type == "toggle" ? "" : "#accordion-" + props.id}>
                            <div className="card-body">
                                <TinyMceContent>{item.content}</TinyMceContent>
                            </div>
                        </div>
                    </div>))}
            </div>
        </>
    )
}

export default AccordionWidget