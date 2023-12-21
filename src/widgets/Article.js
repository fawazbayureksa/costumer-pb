import React, { useEffect, useState } from "react";
import axios from "axios";
import Config from "../components/axios/Config";
import { TinyMcePreview } from "../components/helpers/TinyMceEditor";
import TextTruncate from "../components/helpers/TextTruncate";
import Paginate from "../components/helpers/Paginate";
import InfiniteScroll from 'react-infinite-scroll-component';
import update from 'immutability-helper'
import CmsRoutePath from "../pages/cms/CmsRoutePath";
import { Link } from "react-router-dom";
import CustomImage, { PublicStorageFolderPath } from "../components/helpers/CustomImage";
import $ from "jquery";
import { withTranslation } from "react-i18next";
import { DateTimeFormat } from "../components/helpers/DateTimeFormat";

/**
 * 
 * @param {object} data data for this component
 */
const Article = (props) => {
    const { t } = props;

    const [articles, set_articles] = useState([])
    const [page, set_page] = useState(1)
    const [per_page, set_per_page] = useState(props.data.post_per_page)
    const [page_total, set_page_total] = useState(0)
    const [has_more, set_has_more] = useState(true)

    useEffect(() => {
        getArticleDetail()
        console.log('ar..', props.data)
    }, [page, per_page])

    const getArticleDetail = () => {
        let param = {
            cms_article_category_id: props.data.cms_article_category_id,
            pull_article_by: props.data.pull_article_by,
            order: props.data.order,
            order_by: props.data.order_by,
            per_page: per_page,
            page: page,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticlePaginate`, Config({}, param)).then(response => {
            if (props.data.pagination_type === "no_pagination") {
                set_articles(response.data.data.data)
            }
            if (props.data.pagination_type === "pagination") {
                set_articles(response.data.data.data)
                set_page_total(response.data.data.last_page)
            }
            else if (props.data.pagination_type === "load_more") {
                set_articles(update(articles, {
                    $push: response.data.data.data
                }))
                if (response.data.data.data.length !== 0 && response.data.data.page !== response.data.data.last_page) set_has_more(true)
                else set_has_more(false)
            }

            console.log(param, response.data.data.data)
        }).catch(error => {
            console.error(error);
            set_has_more(false)
        }).finally(() => {
            //
        });
    }

    const onPageChange = (selected) => {
        set_page(selected)
    }
    const loadMore = () => {
        if (has_more) {
            set_page(page + 1)
        }
    }

    return (
        <div style={{
            backgroundColor: props.data.background_transparent === 'color' ? (props.data.background_color ? props.data.background_color : 'unset') : 'transparent',
            height: props.data.height || 'auto',
        }}>
            {props.data.pagination_type === "no_pagination" &&
                <ArticlesFormat articles={articles} data={props.data} t={props.t} />}

            {props.data.pagination_type === "pagination" && <>
                <ArticlesFormat articles={articles} data={props.data} t={props.t} />

                <div className="mt-3">
                    <Paginate pageCount={page_total} onPageChange={onPageChange} initialPage={page} />
                </div>
            </>}

            {props.data.pagination_type === "load_more" && <>
                <ArticlesFormat articles={articles} data={props.data} t={props.t} />

                <div className="mt-3 text-center">
                    {has_more && <label className="p-2 border accent-color" onClick={loadMore}>{props.t("article.show_more")}</label>}
                </div>
            </>}

            {/* {props.data.pagination_type === "load_more" && <InfiniteScroll
                    dataLength={articles.length} //This is important field to render the next data
                    next={loadMore}
                    hasMore={has_more}
                    loader={<h4>Loading...</h4>}
                    endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>All articles have been loaded</b>
                    </p>
                    }
                >
                <ArticlesFormat articles={articles} data={props.data} />
            </InfiniteScroll>} */}
        </div>
    )
}

export default withTranslation()(Article)

export const ArticlesFormat = ({ data, articles, t }) => (
    <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${data.display_type === "grid" ? data.number_of_columns : 1}, 1fr)`,
        gap: data.item_spacing
    }}>
        {articles.map((item, index) => (
            <Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)} key={item.id} className="text-decoration-none color-374650">
                <div style={{
                    borderTopWidth: data.border_size_top,
                    borderLeftWidth: data.border_size_left,
                    borderRightWidth: data.border_size_right,
                    borderBottomWidth: data.border_size_bottom,
                    borderColor: data.border_color,
                    borderStyle: 'solid'
                }}>
                    {data.display_type === "grid" || data.layout === 'large' ? <>
                        <ImageFormat item={item} data={data} />
                        <div style={{
                            padding: `${data.text_padding_top} ${data.text_padding_right} ${data.text_padding_bottom} ${data.text_padding_left}`
                        }}>
                            <TitleFormat item={item} data={data} />
                            {data.show_meta_info === "yes" &&
                                <div className="mt-1">
                                    {data.show_date === "yes" && <p className="m-0 font-size-70-percent color-707070">{DateTimeFormat(item.updated_at, 0)}</p>}
                                    {data.show_category === "yes" && <p className="m-0 font-size-70-percent color-707070">Category: {item.cms_article_category.name}</p>}
                                </div>}
                            <ExcerptFormat item={item} data={data} />
                            <p className="mb-0 mt-2 small"><Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)} className="accent-color">{t("article.read_more")}</Link></p>
                        </div>
                    </> :
                        <>
                            <div className="row no-gutters">
                                <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                    <ImageFormat item={item} data={data} height="100%" />
                                </div>
                                <div className="col-12 col-sm-12 col-md-8 col-lg-8 col-xl-8 mt-2 mt-sm-2 mt-md-0 mt-lg-0 mt-xl-0 pl-2">
                                    <TitleFormat item={item} data={data} />
                                    {data.show_meta_info === "yes" &&
                                        <div className="mt-1">
                                            {data.show_date === "yes" && <p className="m-0 font-size-70-percent color-707070">{DateTimeFormat(item.updated_at, 0)}</p>}
                                            {data.show_category === "yes" && <p className="m-0 font-size-70-percent color-707070">Category: {item.cms_article_category.name}</p>}
                                        </div>}
                                    <ExcerptFormat item={item} data={data} />
                                    <p className="mb-0 mt-2 small"><Link to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", item.url)} className="accent-color">{t("article.read_more")}</Link></p>
                                </div>
                            </div>
                        </>}
                    {/* {data.layout === "title_only" &&
                    <>
                        <div className={index === 0 ? '' : 'mt-1'}>
                            <TitleFormat item={item} data={data} />
                            <p className="m-0 font-size-70-percent color-707070">{DateTimeFormat(item.created_at,0)}</p>
                        </div>
                        <div className="mt-1" style={{borderTop: '1px solid #181818'}} />
                    </>} */}
                </div>
            </Link>
        ))}
        {/* {data.layout === 'title_only' && <p className="mb-0 mt-3 "><Link to={CmsRoutePath.ARTICLES} className="">{t("article.read_more")}</Link></p>} */}
    </div>
)

export const ImageFormat = ({ item, data, height }) => {
    const [imgHeight, setImgHeight] = useState("100%");

    const responsiveView = () => {
        let imgWidth = $('.img-article').eq(0).width();
        setImgHeight(`${parseInt(imgWidth) * 0.6665}px`);
    }

    useEffect(() => {
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    return (
        <>
            {data.show_thumbnail === "yes" &&
                <CustomImage
                    folder={PublicStorageFolderPath.cms}
                    filename={item.feature_image}
                    alt={item.feature_image}
                    className="w-100 object-fit-cover img-article"
                    style={{ height: height || imgHeight }}
                    onLoad={() => responsiveView()}
                />}
        </>
    );
}

export const TitleFormat = ({ item, data }) => (<>
    {data.show_title === "yes" && <p className="m-0" style={{ minHeight: "2.5em" }}>
        <TextTruncate lineClamp={2}><p className={`${data.layout === 'title_only' ? '' : 'font-weight-bold'} small color-0063B0`}>{item.title}</p></TextTruncate>
    </p>}
</>)

export const ExcerptFormat = ({ item, data }) => (<>
    {data.content_display === "excerpt" && <TextTruncate lineClamp={data.excerpt_length}>
        <TinyMcePreview className="font-size-70-percent text-body mt-2" style={{ minHeight: "4.5em" }}>{item.value}</TinyMcePreview>
    </TextTruncate>}
</>)