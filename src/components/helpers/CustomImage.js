import { useEffect, useState } from "react";
import axios from 'axios';
import Config from "../../components/axios/Config";


export const PublicStorageFolderPath = {
    cms: 'cms',
    products: 'marketplace/products',
    customer: 'customer',
    product_review: 'product_review',
    seller: 'seller',
    voucher: 'marketplace/voucher',
    menu: 'menu',
    membership: 'membership'
}

export const ImageGetPublicUrl = async (folder, filename) => {
    if (!folder || !filename) {
        return ''
    }

    let params = {
        folder: folder,
        filename: filename
    }
    let url = process.env.REACT_APP_BASE_API_URL + "images/getPublicUrl"
    return await axios.get(url, Config({
    }, params)).then(response => {
        return response.data
    }).catch(error => {
        console.log(error)
    })
}

const CustomImage = (props) => {
    const [filename, set_filename] = useState('/images/placeholder.png')

    useEffect(() => {
        getImageUrl()
    }, [props.filename])

    const getImageUrl = async () => {
        let url = await ImageGetPublicUrl(props.folder, props.filename)
        set_filename(url)
    }

    return (

        <img
            alt={props.alt}
            src={filename}
            className={props.className}
            style={props.style}
            onLoad={props.onLoad}
            onError={event => event.target.src = "/images/placeholder.gif"}
            onClick={props.onClick}
        />

    )
}

export default CustomImage