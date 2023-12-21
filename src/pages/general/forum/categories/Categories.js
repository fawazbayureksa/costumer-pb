import React, { useEffect, useState } from 'react';
import { useTranslation, withTranslation } from "react-i18next";
import { Tabs, Tab } from "react-bootstrap";
import MyContext from "../../../../components/MyContext";
import All from "./AllCategories"
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import axios from 'axios';
import SwalToast from '../../../../components/helpers/SwalToast';
import Config from '../../../../components/axios/Config';
import Cookies from 'js-cookie';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import SelectCategory from '../components/SelectCategory';
import { useParams } from 'react-router-dom';


const Categories = () => {
    const [key, setKey] = useState('new');
    const [search, setSearch] = useState('dsdsdsds');
    const [tabName, setTabName] = useState([]);
    const [dataBanner, setDataBanner] = useState()
    const Style = (props) => {
        return (
            <style jsx="true">{`
                .nav-tabs .nav-link {
                    border: none;
                    margin-left : 2rem;
                    margin-right: 2rem;
                }
                .nav-tabs .nav-link.active {
                    border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                    color:#F8931D;
                    font-weight:700;     
                }
                .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                    font-weight:700;  
                }
                .nav-tabs a:hover {
                    color: ${props.themes ? props.themes.accent_color.value : ''};
                }
            `}</style>
        )
    }

    const params = useParams()

    useEffect(() => {
        getBanner()
    }, [])

    useEffect(() => {
        getCategories()
    }, [params.id])

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1,
        },
        tablet: {
            breakpoint: { max: 767, min: 464 },
            items: 1,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
        }
    };


    const getBanner = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}forum/banner/get`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })

        ).then(response => {
            let data = response.data.data;
            setDataBanner(data);
        }).catch(error => {
            console.log(error)
            if (error.response) {
                SwalToast.fire({
                    icon: "error",
                    title: error.response.data.message
                })
            } else {
                SwalToast.fire({
                    icon: "error",
                    title: "Something went wrong",
                })
            }
        })
    }

    const getCategories = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}forum/categories/get`;
        let category = []
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            let data = response.data.data
            // if (params.id === "all") {
            category =
                data.map((item) => (
                    item.parent_id !== null &&
                    {
                        name: item.name,
                        id: item.id
                    }
                ))
            setTabName(category.filter(x => !!x))
            // } else {

            //     let x = data.filter((item) => item.parent_id === parseInt(params.id))
            //     setTabName(x)
            // }
        }).catch(error => {
            console.log(error)
            if (error.response) {
                SwalToast.fire({
                    icon: "error",
                    title: error.response.data.message
                })
            } else {
                SwalToast.fire({
                    icon: "error",
                    title: "Something went wrong",
                })
            }
        })
    }
    // console.log(tabName)


    const { t } = useTranslation();
    return (
        <MyContext.Consumer>{context => (
            <>
                {!dataBanner ?
                    <div>Loading</div>
                    :
                    <>
                        <Style themes={context.theme_settings} />
                        <div style={{ marginTop: -16 }}>

                            {/* {/* <h4 className='h4 font-weight-bold'>Tokodapur Forum</h4> */}
                            {/* <h6 className='h6 font-weight-semi-bold'>Tanya jawab seputar ilmu dapur di sini</h6> */}
                        </div>
                        <Carousel
                            responsive={responsive}
                            autoPlay={dataBanner?.auto_play == "disable" ? false : true}
                            autoPlaySpeed={dataBanner?.slideshow_speed}
                            transitionDuration={dataBanner?.animation_speed}
                            infinite={dataBanner?.auto_play == "disable" ? false : true}
                            showDots={dataBanner?.indicator === "pagination"}
                        >
                            {dataBanner &&
                                dataBanner?.forum_banner_slide.map((image, index) => (
                                    <div key={index}>
                                        <CustomImage
                                            folder={PublicStorageFolderPath.cms}
                                            style={{
                                                width: parseInt(dataBanner.width),
                                                height: parseInt(dataBanner?.height),
                                                borderRadius: 10
                                            }}
                                            filename={image?.filename}
                                            alt={image?.filename} />
                                    </div>
                                ))}
                        </Carousel>

                        <Tabs id="controlled-tab"
                            className="row mb-3 mt-3" activeKey={key} onSelect={(k) => setKey(k)}>
                            <Tab tabClassName="mx-0 mx-sm-0 mx-md-3" eventKey="new" title={t('forum_all')}>
                                <All />
                            </Tab>
                            {tabName.map((tab, index) => (
                                <Tab
                                    tabClassName="mx-0 mx-sm-0 mx-md-0"
                                    eventKey={index}
                                    title={tab.name}>
                                    <All
                                        category_id={tab.id}
                                        search={search}
                                    />
                                    {/* {tab.name} */}
                                </Tab>
                            ))}
                        </Tabs>
                    </>
                }
            </>
        )}</MyContext.Consumer>
    )
}

export default withTranslation()(Categories)