import React, { useEffect, useState } from "react";
import { ImageGetPublicUrl } from "./CustomImage";

const CustomVideo = (props) => {
    const [filename, set_filename] = useState('')

    useEffect(() => {
        getVideoUrl()
    }, [props.filename])

    const getVideoUrl = async () => {
        let url = await ImageGetPublicUrl(props.folder, props.filename)
        set_filename(url)
    }

    return (
        <>
            {filename &&
                <video
                    className={props.className}
                    style={props.style}
                    key={props.key}
                    index={props.index}
                    width={props.width || "auto"}
                    height={props.height || "auto"}
                    controls={props.controls}
                    autoPlay={props.autoplay}
                    loop={props.loop}
                    muted={props.muted}
                >
                    <source src={filename} type={`video/${props.filename.split(".").pop()}`} />
                    Your browser does not support the video tag.
                </video>}
        </>
    )
}

export default CustomVideo