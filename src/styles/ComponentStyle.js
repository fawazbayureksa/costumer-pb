/**
 * 
 * @param {object} style style data from the section database
 * @param {string} themes global theme settings from database
 * @param {string} cssID ID to distinguish different section
 */
 const ComponentStyle = ({style, themes, cssID})=>{
    if(style && themes && cssID) return(
        <style>{`
            #${cssID} {
                border-top: ${style.border_top || '0'} solid ${style.border_color || '#000000'};
                border-right: ${style.border_right || '0'} solid ${style.border_color || '#000000'} ;
                border-bottom: ${style.border_bottom || '0'} solid ${style.border_color || '#000000'};
                border-left: ${style.border_left || '0'} solid ${style.border_color || '#000000'} ;
                
                padding-top: ${style.padding_top || 'unset'};
                padding-right: ${style.padding_right || 'unset'};
                padding-bottom: ${style.padding_bottom || 'unset'};
                padding-left: ${style.padding_left || 'unset'};

                margin-top: ${style.margin_top || 'unset'};
                margin-right: ${style.margin_right || 'unset'};
                margin-bottom: ${style.margin_bottom || 'unset'};
                margin-left: ${style.margin_left || 'unset'};
            }
        `}</style>
    )
    else return null
}

export default ComponentStyle