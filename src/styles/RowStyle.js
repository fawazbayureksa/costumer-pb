/**
 * 
 * @param {object} style style data from the section database
 * @param {string} themes global theme settings from database
 * @param {string} cssID ID to distinguish different section
 */
const RowStyle = ({ style, themes, cssID }) => {

    const getVerticalAlignment = (vertical_align) => {
        if (vertical_align === "top") return `align-items: flex-start;`
        else if (vertical_align === "center") return `align-items: center;`
        else if (vertical_align === "bottom") return `align-items: flex-end;`
        else if (vertical_align === "stretch") return `align-items: stretch;`
        else return ''
    }

    if (style && themes && cssID) return (
        <style>{`
            #${cssID} {              
                display: flex;
                border-top: ${style.border_top || '0'} solid ${style.border_color || '#000000'};
                border-right: ${style.border_right || '0'} solid ${style.border_color || '#000000'} ;
                border-bottom: ${style.border_bottom || '0'} solid ${style.border_color || '#000000'};
                border-left: ${style.border_left || '0'} solid ${style.border_color || '#000000'} ;
                ${style.background_type === "color" ?
                `background-color: ${((style.background_transparent === 'color') ? (style.background_color ? style.background_color : 'unset') : 'transparent')};`
                : style.background_type === "gradient" ?
                    `background: ${style.background_gradient_type}-gradient(${style.background_gradient_type === 'linear' ? `${style.background_gradient_angle}deg` : `circle`}, ${style.background_gradient_start_color} ${style.background_gradient_start_position}%, ${style.background_gradient_end_color} ${style.background_gradient_end_position}%);`
                    : style.background_type === "image" ? `
                    background-image: url("${style.background_image}");
                    background-repeat: no-repeat;
                    background-size: cover;
                ` : ""}
                text-align: ${style.text_align || 'left'};
                padding-top: ${style.padding_top || 'unset'};
                padding-right: ${style.padding_right || 'unset'};
                padding-bottom: ${style.padding_bottom || 'unset'};
                padding-left: ${style.padding_left || 'unset'};
                min-height: ${style.height || 'auto'};
                ${getVerticalAlignment(style.vertical_align)}         
            }
        `}</style>
    )
    else return null
}

export default RowStyle