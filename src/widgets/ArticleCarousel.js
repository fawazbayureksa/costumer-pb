import React, { useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { TinyMcePreview } from "../components/helpers/TinyMceEditor";
import TextTruncate from "../components/helpers/TextTruncate";
import CmsRoutePath from "../pages/cms/CmsRoutePath";
import { Link } from "react-router-dom";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import { withTranslation } from "react-i18next";
import { DateTimeFormat } from "../components/helpers/DateTimeFormat";

/**
 *
 * @param {object} data data for this component
 */
const ArticleCarousel = (props) => {
    const { t } = props;
    const [articles, set_articles] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        getArticleDetail();
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    const getArticleDetail = () => {
        let param = {
            cms_article_category_id: props.data.cms_article_category_id,
            sort_by: props.data.sort_by,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticle`, Config({}, param)).then(response => {
            set_articles(response.data.data.data)
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: windowWidth <= 575.98 ? 1.35 : (windowWidth >= 576 && windowWidth <= 767.98) ? 2 : (windowWidth >= 768 && windowWidth <= 991.98) ? 2.25 : props.data.number_of_articles,
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: windowWidth <= 575.98 ? 1.35 : (windowWidth >= 576 && windowWidth <= 767.98) ? 2 : (windowWidth >= 768 && windowWidth <= 991.98) ? 2.25 : props.data.number_of_articles,
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: windowWidth <= 575.98 ? 1.35 : (windowWidth >= 576 && windowWidth <= 767.98) ? 2 : (windowWidth >= 768 && windowWidth <= 991.98) ? 2.25 : props.data.number_of_articles,
        }
    };

    return (
        <div>
            {props.data.type === 'banner' ?
                <>
                    {articles.length > 0 &&
                        <div>
                            <style>{`
                            .img-article-banner {
                                width: 10vw;
                                height: 10vw;
                            }
                            @media only screen and (max-width: 767px) {
                                .img-article-banner {
                                    width: 16vw;
                                    height: 16vw;
                                }
                            }
                        `}</style>
                            <div className="d-flex justify-content-between align-items-end" style={{ borderBottom: "2px solid #DB4437" }}>
                                <p className="m-0 font-weight-bold">{props.data.banner_title}</p>
                                {/*<Link to={CmsRoutePath.ARTICLES} className="m-0 small">See All</Link>*/}
                            </div>
                            <div className="row mt-3">
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6">
                                    <div className="h-100 bg-dark text-white">
                                        <Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", articles[0].url)}>
                                            <CustomImage folder={PublicStorageFolderPath.cms} filename={articles[0].feature_image} alt={articles[0].feature_image} className="w-100 h-100 object-fit-cover" />
                                            <div className="card-img-overlay d-flex align-items-end">
                                                <div className="w-100 p-4" style={{ backgroundColor: 'rgba(0, 51, 102, 0.3)' }}>
                                                    <TextTruncate className="card-title" lineClamp={1}>
                                                        <h5 className="m-0 font-weight-bold text-white small capitalize">{articles[0].title}</h5>
                                                    </TextTruncate>
                                                    <p className="m-0 font-size-60-percent text-white">{DateTimeFormat(articles[0].created_at, 0)}</p>
                                                    {props.data.layout === "post_with_title_and_excerpt" &&
                                                        <TextTruncate className="text-justify card-text font-size-60-percent mt-3" lineClamp={2}>
                                                            <TinyMcePreview>{articles[0].value}</TinyMcePreview>
                                                        </TextTruncate>}
                                                    <div className="" key={articles[0].id}>
                                                        <p className="mt-2 font-size-60-percent text-white d-flex align-items-center">{t("article.read_more")} &nbsp; <i className="fas fa-arrow-right" /></p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                </div>
                                <div className="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-3 mt-sm-3 mt-md-0 mt-lg-0 mt-xl-0">
                                    {articles.slice(0, 4).map((item, index) => {
                                        if (index !== 0) {
                                            return (
                                                <Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)}>
                                                    <div className={`d-flex align-items-center ${index !== 1 ? "mt-2" : ""}`} key={item.id}>
                                                        <CustomImage folder={PublicStorageFolderPath.cms} filename={item.feature_image} alt={item.feature_image} className="object-fit-cover img-article-banner" />
                                                        <div className="ml-2">
                                                            <TextTruncate className="" lineClamp={1}>
                                                                <p className="m-0 font-weight-bold color-0063B0 small capitalize">{item.title}</p>
                                                            </TextTruncate>
                                                            <p className="m-0 font-size-60-percent color-707070">{DateTimeFormat(item.created_at, 0)}</p>
                                                            {props.data.layout === "post_with_title_and_excerpt" &&
                                                                <TextTruncate className="font-size-60-percent mt-2" lineClamp={1}>
                                                                    <TinyMcePreview>{item.value}</TinyMcePreview>
                                                                </TextTruncate>}
                                                            <div className="">
                                                                <p className="mb-0 mt-2 font-size-60-percent color-DB4437 font-weight-bold d-flex align-items-center capitalize">{t("article.read_more")} &nbsp; <i className="fas fa-arrow-right" /></p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </div>}
                </> :
                <div className="overflow-hidden">
                    <div style={{ margin: '0 -1rem' }}>
                        <Carousel responsive={responsive} itemClass="px-3">
                            {props.data.type === 'detail' ?
                                articles.map((item, index) => (
                                    <Link key={item.id} to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)}
                                        className="text-decoration-none color-374650">
                                        <CustomImage folder={PublicStorageFolderPath.cms} filename={item.feature_image} alt={item.feature_image} className="w-100 object-fit-cover" style={{ height: windowWidth <= 575.98 ? 150 : (windowWidth >= 576 && windowWidth <= 767.98) ? 160 : (windowWidth >= 768 && windowWidth <= 991.98) ? 175 : 200 }} />
                                        <TextTruncate className={`mt-2 ${props.data.layout === "post_with_title_and_excerpt" ? "text-left" : "text-center"}`} lineClamp={1}>
                                            <p className="m-0 font-weight-bold" style={{ paddingRight: props.data.layout === "post_with_title_and_excerpt" ? "unset" : "1.5ch" }}>{item.title}</p>
                                        </TextTruncate>
                                        {props.data.layout === "post_with_title_and_excerpt" &&
                                            <TextTruncate className="small mt-1" lineClamp={3}>
                                                <TinyMcePreview>{item.value}</TinyMcePreview>
                                            </TextTruncate>}
                                    </Link>
                                )) :
                                props.data.type === 'simple' ?
                                    articles.map((item, index) => (
                                        <Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)}
                                            className="card bg-dark text-white" key={item.id}>
                                            <CustomImage folder={PublicStorageFolderPath.cms} filename={item.feature_image}
                                                alt={item.feature_image} className="w-100 object-fit-cover"
                                                style={{ height: windowWidth <= 575.98 ? 150 : (windowWidth >= 576 && windowWidth <= 767.98) ? 160 : (windowWidth >= 768 && windowWidth <= 991.98) ? 175 : 200 }} />
                                            <div className="card-img-overlay d-flex align-items-center">
                                                <div className="">
                                                    <TextTruncate className="card-title" lineClamp={1}>
                                                        <p className="m-0 font-weight-bold text-white">{item.title}</p>
                                                    </TextTruncate>
                                                    {props.data.layout === "post_with_title_and_excerpt" &&
                                                        <TextTruncate className="card-text small mt-4" lineClamp={3}>
                                                            <TinyMcePreview>{item.value}</TinyMcePreview>
                                                        </TextTruncate>}
                                                </div>
                                            </div>
                                        </Link>
                                    )) :
                                    props.data.type === 'detail_without_image' ?
                                        articles.map((item, index) => (
                                            <Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)}
                                                className="card bg-white text-decoration-none p-5" key={item.id}>
                                                <div className="position-relative"
                                                    style={{ height: windowWidth <= 575.98 ? 200 : 280 }}>
                                                    <TextTruncate className="card-title text-center mb-5" lineClamp={1}>
                                                        <h5 className="m-0 font-weight-bold">{item.title}</h5>
                                                    </TextTruncate>
                                                    {props.data.layout === "post_with_title_and_excerpt" &&
                                                        <TextTruncate className="text-justify card-text small mt-4"
                                                            lineClamp={5}>
                                                            <TinyMcePreview
                                                                className="text-center">{item.value}</TinyMcePreview>
                                                        </TextTruncate>}
                                                    <p className="m-0 position-absolute w-100 text-center"
                                                        style={{ bottom: '1rem' }}>Learn more</p>
                                                </div>
                                            </Link>
                                        )) : <div></div>
                            }
                        </Carousel>
                    </div>
                </div>}
        </div>
    )
}

export default withTranslation()(ArticleCarousel)
