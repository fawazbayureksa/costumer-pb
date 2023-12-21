import axios from "axios";
import Carousel from 'react-multi-carousel';
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import Config from "../../../../components/axios/Config";
import IsEmpty from "../../../../components/helpers/IsEmpty";
import SwalToast from "../../../../components/helpers/SwalToast";
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";

const SliderBanner = ({ data }) => {

    // const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    // const [data, setdata] = useState()

    // const responsiveView = () => {
    //     let widthOfWindow = window.innerWidth;
    //     setWindowWidth(widthOfWindow);
    // }

    // useEffect(() => {
    //     getdata();
    // }, [])

    // const getdata = () => {

    //     let url = `${process.env.REACT_APP_BASE_API_URL}auction/welcomePage`

    //     axios.get(url, Config({
    //         Authorization: `Bearer ${Cookies.get("token")}`,
    //     })).then(response => {
    //         let data = response.data.data.auction_banner;
    //         setdata(data);
    //     }).catch(error => {
    //         console.log(error)
    //         if (error.response) {
    //             SwalToast.fire({
    //                 icon: "error",
    //                 title: error.response.data.message
    //             })
    //         } else {
    //             SwalToast.fire({
    //                 icon: "error",
    //                 title: "Something went wrong",
    //             })
    //         }
    //     })
    // }


    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 2,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        }
    };


    return (
        <>
            <style>{`
                .react-multi-carousel-list .card {
                    border: none;
                }
            `}</style>
            {data?.mp_auction_banner_slide.length > 0 &&
                <Carousel
                    responsive={responsive}
                    arrows={true}
                    autoPlay={data?.auto_play == "enable" ? true : false}
                    infinite={data?.auto_play == "enable" ? true : false}
                    itemClass={`place-self-center"`}
                >
                    {data?.mp_auction_banner_slide.map((item, index) => (
                        <a href={item.link} key={item.id}>
                            <CustomImage
                                filename={item.filename}
                                folder={PublicStorageFolderPath.cms}
                                className="w-100 object-fit-cover"
                            />
                        </a>
                    ))}
                </Carousel>
            }
            {/* cek */}
        </>
    )
}

export default SliderBanner;
