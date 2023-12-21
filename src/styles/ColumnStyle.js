/**
 * 
 * @param {object} style style data from the section database
 * @param {string} themes global theme settings from database
 * @param {string} cssID ID to distinguish different section
 */
const ColumnStyle = ({style, themes, cssID})=>{
    if(style && themes && cssID) return(
        <style>{`
            #${cssID} {
                ${style.content_layout === 'block' ? `display: block;` : 'display: flex;'}
                ${(style.content_layout !== '' && style.content_layout !== 'block') ? `flex-direction: ${style.content_layout};` : ''}
                ${style.column_alignment ? `justify-content: ${style.column_alignment};` : ''}
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
                
                margin-top: ${style.margin_top || 'unset'};
                margin-right: ${style.margin_right || 'unset'};
                margin-bottom: ${style.margin_bottom || 'unset'};
                margin-left: ${style.margin_left || 'unset'};
                
                align-items: center;
            }
        `}</style>
    )
    else return null
}

export default ColumnStyle