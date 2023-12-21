import React, { PureComponent } from "react";
import Template from "../../../components/Template";
import MyContext from "../../../components/MyContext";
import axios from "axios";
import Config from "../../../components/axios/Config";
import { TinyMceContent } from "../../../components/helpers/TinyMceEditor";
import { Link } from "react-router-dom";
import CmsRoutePath from "../CmsRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../../../components/helpers/CustomImage";
import TextTruncate from "../../../components/helpers/TextTruncate";
import $ from "jquery";
import { DateTimeFormat } from "../../../components/helpers/DateTimeFormat";

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #article-detail {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                @media (max-width: 765.98px) {
                    #article-detail {
                        padding-right: 18px;
                        padding-left: 18px;
                    }
                }
            `}</style>
        );
    } else return null;
}

class ArticleDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isNotFound: false,
            detail: null,
            recent: [],
            recent_img: "100%",
            detail_img: "100%",
            recent_limit: 0,
            popular: [],
            popular_limit: 0
        };
    }

    componentDidMount() {
        this.responsiveView();
        window.addEventListener('resize', this.responsiveView);
        this.getArticleDetail();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props !== prevProps) {
            this.getArticleDetail();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.responsiveView);
    }

    responsiveView = () => {
        let imgRecentWidth = $('.img-recent-article').width();
        let imgDetailWidth = $('.img-detail-article').width();
        this.setState({
            recent_img: `${parseInt(imgRecentWidth) * 0.6665}px`,
            detail_img: `${parseInt(imgDetailWidth) * 0.6665}px`,
        });
    }

    getMasterData = () => {
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticleMasterData`, Config()).then(response => {
            response.data.data.config = JSON.parse(response.data.data.config) || {};
            this.setState({
                config: response.data.data.config,
                recent_limit: parseInt(response.data.data.config.number_recent_post),
                popular_limit: parseInt(response.data.data.config.number_popular_post)
            }, () => {
                if (response.data.data.config.recent_post === "yes") this.getArticleRecent()
                if (response.data.data.config.popular_post === "yes") this.getArticlePopular()
            });
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }

    getArticleDetail = () => {
        let params = {
            slug: (this.props.match.params.slug)
        }

        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticleDetail`, Config({}, params))
            .then(response => {
                this.setState({
                    detail: response.data.data
                }, () => this.getMasterData())
            }).catch(error => {
                console.error(error);
                this.setState({
                    isNotFound: true
                });
            }).finally(() => {
                //
            });
    }

    getArticleRecent = () => {
        let params = {
            limit: this.state.recent_limit,
            category: this.state.detail.cms_article_category.name
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticleRecent`, Config({}, params)).then(response => {
            this.setState({
                recent: response.data.data
            });
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    getArticlePopular = () => {
        let params = {
            limit: this.state.popular_limit
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticlePopular`, Config({}, params)).then(response => {
            this.setState({
                popular: response.data.data
            });
        }).catch(error => {
            console.error(error);
        }).finally(() => {
            //
        });
    }

    render() {
        return (
            <Template>
                <MyContext.Consumer>{(context) => (
                    <>
                        <Style themes={context.theme_settings} />
                        <div id="article-detail">
                            <div className="row py-4">
                                <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9">
                                    {this.state.detail &&
                                        <>
                                            <h5 className="mb-2 font-weight-semi-bold color-374650">{this.state.detail.title}</h5>
                                            <p className="mb-3 font-size-60-percent color-374650">{DateTimeFormat(this.state.detail.publish_date, 0)}</p>
                                            <CustomImage folder={PublicStorageFolderPath.cms} filename={this.state.detail.feature_image} alt={this.state.detail.feature_image} className="w-100 object-fit-cover img-detail-article" style={{ height: this.state.detail_img }} />
                                            <TinyMceContent className="mt-3">{this.state.detail.value}</TinyMceContent>
                                        </>}
                                    {this.state.isNotFound &&
                                        <h3 className="mb-4 font-weight-semi-bold color-374650">Not Found</h3>}
                                </div>
                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 mt-4 mt-sm-4 mt-md-0 mt-lg-0 mt-xl-0">
                                    {this.state.config && this.state.config.recent_post === "yes" && <>
                                        <div className="border p-2">
                                            <h6 className="m-0 font-weight-semi-bold text-center color-374650">Recent</h6>
                                        </div>
                                        <div className="mt-3 mt-sm-3 mt-md-4 mt-lg-4 mt-xl-4">
                                            {this.state.recent.map((value, index) => (
                                                <Link key={value.id} to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", value.url)} className="text-decoration-none">
                                                    <div style={{ display: 'grid', gridTemplateColumns: this.state.config && this.state.config.thumbnail === "yes" ? '1fr 1fr' : '1fr', gap: 5, marginTop: this.state.config && this.state.config.item_spacing }}>
                                                        {this.state.config && this.state.config.thumbnail === "yes" && <CustomImage folder={PublicStorageFolderPath.cms} filename={value.feature_image} alt={value.feature_image} className="w-100 object-fit-cover img-recent-article" style={{ height: this.state.recent_img }} />}
                                                        <div>
                                                            <TextTruncate lineClamp={2}>
                                                                <p className="m-0 font-size-80-percent color-374650" style={{ color: this.state.config && this.state.config.title_text_color }}>{value.title}</p>
                                                            </TextTruncate>
                                                            <p className="m-0 font-size-70-percent color-374650">{DateTimeFormat(value.publish_date, 0)}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>}
                                    {this.state.config && this.state.config.popular_post === "yes" && <>
                                        <div className="border p-2 mt-5">
                                            <h6 className="m-0 font-weight-semi-bold text-center color-374650">Popular</h6>
                                        </div>
                                        <div className="mt-3 mt-sm-3 mt-md-4 mt-lg-4 mt-xl-4">
                                            {this.state.popular.map((value, index) => (
                                                <Link key={value.id} to={CmsRoutePath.ARTICLE_SLUG.replace(":slug", value.url)} className="text-decoration-none">
                                                    <div style={{ display: 'grid', gridTemplateColumns: this.state.config && this.state.config.thumbnail === "yes" ? '1fr 1fr' : '1fr', gap: 5, marginTop: this.state.config && this.state.config.item_spacing }}>
                                                        {this.state.config && this.state.config.thumbnail === "yes" && <CustomImage folder={PublicStorageFolderPath.cms} filename={value.feature_image} alt={value.feature_image} className="w-100 object-fit-cover img-recent-article" style={{ height: this.state.recent_img }} />}
                                                        <div>
                                                            <TextTruncate lineClamp={2}>
                                                                <p className="m-0 font-size-80-percent color-374650" style={{ color: this.state.config && this.state.config.title_text_color }}>{value.title}</p>
                                                            </TextTruncate>
                                                            <p className="m-0 font-size-70-percent color-374650">{DateTimeFormat(value.publish_date, 0)}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>}
                                </div>
                            </div>
                        </div>
                    </>
                )}</MyContext.Consumer>
            </Template>
        );
    }
}

export default ArticleDetail