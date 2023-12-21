import React from "react";
import { Helmet } from "react-helmet";

/**
 * 
 * @param {object} data data for this component
 */
const Script = (props) => {
    const htmlparser2 = require("htmlparser2");
    const parseScript = htmlparser2.parseDOM(props.data.value)
    console.log(parseScript)

    return (
        <>
            <Helmet>
                {/* don't put key in script because it wouldn't work */}
                {parseScript.map((value, index) =>
                    (value.type === "script" && value.attribs?.src) ?
                        <script src={value.attribs?.src || ""}>
                            {value.children[0]?.data || ""}
                        </script>
                        : value.type === "script" ?
                            <script>
                                {value.children[0]?.data || ""}
                            </script>
                            : null
                )}
            </Helmet>
        </>
    )
}

export default Script
