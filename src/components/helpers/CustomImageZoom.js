import { useEffect, useState } from "react";
import ReactImageZoom from "react-image-zoom";
import { ImageGetPublicUrl } from "./CustomImage";

const CustomImageZoom = (props) => {
    const [filename, set_filename] = useState('')

    useEffect(() => {
        getImageUrl()
    }, [props.filename])

    const getImageUrl = async () => {
        let url = await ImageGetPublicUrl(props.folder, props.filename)
        set_filename(url)
    }

    return (
        <>
            {filename &&
                <ReactImageZoom
                    zoomPosition={"original"}
                    img={filename}
                    onError={event => event.target.src = `/images/placeholder.gif`}
                    height={props.height}
                />}
        </>
    )
}

export default CustomImageZoom