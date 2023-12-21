
/**
 * 
 * @param {object} style style data from the section database
 * @param {string} themes global theme settings from database
 * @param {string} cssID ID to distinguish different section
 * @param {number} stickyTop calculation of sticky top for sticky style
 */
const SectionStyle2 = ({ style, themes, cssID, stickyTop }) => {
    if (style && themes && cssID) return (
        <style>{`
            #${cssID}  {
                ${(style.box_shadow == 'yes') ? `box-shadow: 0 3px 6px #00000029;` : ""}       
            }
            #${cssID} > div {
                ${style.min_height ? `min-height: ${style.min_height}` : ''};
                height: ${style.height || 'auto'};
                margin-top: ${(style.margin_top === '0' || style.margin_top === '0px' || style.margin_top === 0) ? 'auto' : style.margin_top};
                margin-right: ${(style.margin_right === '0' || style.margin_right === '0px' || style.margin_right === 0) ? 'auto' : style.margin_right};
                margin-left: ${(style.margin_left === '0' || style.margin_left === '0px' || style.margin_left === 0) ? 'auto' : style.margin_left};
                margin-bottom: ${(style.margin_bottom === '0' || style.margin_bottom === '0px' || style.margin_bottom === 0) ? 'auto' : style.margin_bottom};
                padding-top: ${style.padding_top || 'unset'};
                padding-bottom: ${style.padding_bottom || 'unset'};         
            }
            ${style.sticky === 'yes' ? `
                #${cssID} {
                    position: sticky;
                    top: ${stickyTop || 0}px;
                    z-index: 1030;
                }
            `: ``}

            ${themes.layout.value === "boxed" ? `#${cssID}.sticky > div{` : `#${cssID}.sticky{`}
                background-color: ${style.sticky_background_transparent === 'color' ? (style.sticky_background_color ? style.sticky_background_color : 'unset') : 'transparent'};
                font-size: ${style.sticky_font_size || 'auto'};
                padding-top: ${style.sticky_padding_top || 0};
                padding-bottom: ${style.sticky_padding_bottom || 0};
            }

            #${cssID} > div {
                padding-right: ${(style.padding_right !== '' && style.padding_right !== 0 && style.padding_right !== '0' && style.padding_right !== '0px') ? style.padding_right : 'unset'};
                padding-left: ${(style.padding_left !== '' && style.padding_left !== 0 && style.padding_left !== '0' && style.padding_left !== '0px') ? style.padding_left : 'unset'};
            }


            ${themes.layout.value === "boxed" ? `#${cssID} > div{` : `#${cssID}{`}
                
                ${style.background_type === "color" ? `
                    background-color: ${style.background_transparent === 'color' ? (style.background_color ? style.background_color : 'unset') : 'transparent'};
                ` : style.background_type === "gradient" ? `
                    background: ${style.background_gradient_type}-gradient(${style.background_gradient_type === 'linear' ? `${style.background_gradient_angle}deg` : `circle`}, ${style.background_gradient_start_color} ${style.background_gradient_start_position}%, ${style.background_gradient_end_color} ${style.background_gradient_end_position}%);
                ` : style.background_type === "image" ? `
                    background-image: url("${style.background_image}");
                    background-repeat: no-repeat;
                    background-size: cover;
                ` : ""}
                ${style.auto_scroll ? `
                    // max-height: ${window.innerHeight}px;
                ` : ``}
            }

            ${themes.layout.value === "boxed" ? `#${cssID} > div::-webkit-scrollbar{` : `#${cssID}::-webkit-scrollbar{`}
                display: none;
            }
            
            ${themes.layout.value === "boxed" ? `#${cssID} > div{` : `#${cssID}{`}
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }


            #${cssID} > div{
                max-width: ${style.interior_content_width === 'hundred_percent' ? '100%' : themes.site_width.width};
            }
            
            @media only screen and (max-width: 767.98px) {
                #${cssID} > div{
                    padding-left: ${style.interior_content_width === 'hundred_percent' ? 'unset' : themes.page_content_mobile_padding?.padding_left};
                    padding-right: ${style.interior_content_width === 'hundred_percent' ? 'unset' : themes.page_content_mobile_padding?.padding_right};
                }
            }
        `}</style>
    )
    else return null
}

export default SectionStyle2