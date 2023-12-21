import React, { PureComponent } from 'react';
import axios from "axios";
import Config from "../../../components/axios/Config";
import MyContext from "../../../components/MyContext";
import { Link } from "react-router-dom";
import CmsRoutePath from "../CmsRoutePath";
import Template from "../../../components/Template";
import IsEmpty from "../../../components/helpers/IsEmpty";
import { ArticlesFormat } from "../../../widgets/Article";
import Paginate from "../../../components/helpers/Paginate";
import { withTranslation } from "react-i18next";
import CustomImage, { PublicStorageFolderPath } from '../../../components/helpers/CustomImage';
import TextTruncate from "../../../components/helpers/TextTruncate";
import $ from "jquery";
import { DateTimeFormat } from '../../../components/helpers/DateTimeFormat';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #articles {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
                @media (max-width: 765.98px) {
                    #articles {
                        padding-right: 18px;
                        padding-left: 18px;
                    }
                }
            `}</style>
        );
    } else return null;
}

class ArticleList extends PureComponent {
    constructor(props) {
        super(props);
        let params = new URLSearchParams(window.location.search);
        let querySearch = params.get('search');
        let queryType = params.get('type');
        let queryCategory = params.get('category');
        let queryLength = params.get('length');
        let queryPage = params.get('page');
        this.state = {
            isNotFound: false,
            temp_search: querySearch,
            search: querySearch,
            type: queryType,
            category: queryCategory,
            length: queryLength || 9,
            page: parseInt(queryPage) || 1,
            articles: null,
            recent: [],
            recent_img: "100%",
            recent_limit: 0,
            popular: [],
            popular_limit: 0
        };
    }

    componentDidMount() {
        window.addEventListener('resize', this.responsiveView);

        this.generateFilters();
        this.getMasterData();
        this.getArticles();

        this.props.history.listen((location, action) => {
            let params = new URLSearchParams(window.location.search);
            let querySearch = params.get('search');
            let queryType = params.get('type');
            let queryCategory = params.get('category');
            let queryLength = params.get('length');
            let queryPage = params.get('page');
            this.setState({
                search: querySearch,
                type: queryType,
                category: queryCategory,
                length: queryLength || this.state.length,
                page: parseInt(queryPage) || this.state.page,
            }, () => this.getArticles());
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.responsiveView);
    }

    responsiveView = () => {
        let imgWidth = $('.img-recent-article').width();
        this.setState({
            recent_img: `${parseInt(imgWidth) * 0.6665}px`
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

    getArticles = () => {
        let params = {
            search: this.state.search,
            type: this.state.type,
            category: this.state.category,
            page: this.state.page,
            length: this.state.length,
        }
        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getArticleWithParams`, Config({}, params)).then(response => {
            if (response.data.data.data.length === 0) {
                this.setState({
                    isNotFound: true
                });
            } else {
                this.setState({
                    articles: response.data.data,
                    isNotFound: false,
                });
            }
        }).catch(error => {
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
            category: this.state.category
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

    generateFilters = () => {
        let query = '';
        if (!IsEmpty(this.state.search)) query += `search=${this.state.search}`;
        if (!IsEmpty(this.state.type)) query += `&type=${this.state.type}`;
        if (!IsEmpty(this.state.category)) query += `&category=${this.state.category}`;
        if (!IsEmpty(this.state.length)) query += `&length=${this.state.length}`;
        if (!IsEmpty(this.state.page)) query += `&page=${this.state.page}`;
        if (query.charAt(0) === '&') query = query.substr(1);
        this.props.history.push({
            pathname: this.props.history.location.pathname,
            search: query
        });
    }

    render() {
        const { t } = this.props;
        return (
            <Template>
                <MyContext.Consumer>{(context) => (
                    <>
                        <Style themes={context.theme_settings} />
                        <div id="articles">
                            <div className="row py-4">
                                <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9">
                                    {this.state.isNotFound ?
                                        <div className="bg-white rounded shadow-graph p-4">
                                            <div className="row">
                                                <div className="col-2 d-flex align-items-center">
                                                    <img
                                                        src={`/images/empty-article.png`}
                                                        className="w-100"
                                                        onError={event => event.target.src = `/images/placeholder.gif`}
                                                    />
                                                </div>
                                                <div className="col-10 d-flex align-items-center">
                                                    <div className="w-100">
                                                        <p className="m-0 color-858585 font-weight-bold">{t('article.not_found')}</p>
                                                        <p className="m-0 color-858585 ">{t('article.try_again')}</p>
                                                        <div className="row">
                                                            <div className="col-12 col-sm-12 col-md-4 col-lg-4 col-xl-4">
                                                                <div className="input-group mt-2">
                                                                    <input
                                                                        type="text"
                                                                        className="form-control"
                                                                        placeholder="Search"
                                                                        value={this.state.temp_search}
                                                                        onChange={event => this.setState({
                                                                            temp_search: event.target.value
                                                                        })}
                                                                        onKeyUp={event => {
                                                                            if (event.keyCode === 13) this.setState({
                                                                                search: this.state.temp_search,
                                                                                articles: null,
                                                                            }, () => this.generateFilters());
                                                                        }}
                                                                    />
                                                                    <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={event => this.setState({
                                                                        search: this.state.temp_search,
                                                                        articles: null,
                                                                    }, () => this.generateFilters())}>
                                                                        <span className="input-group-text">
                                                                            <i className="fas fa-search" />
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Link to={'/'} className="m-0 accent-color ">{t('article.back_to_home')}</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div> :
                                        <div className="input-group">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Search"
                                                value={this.state.temp_search}
                                                onChange={event => this.setState({
                                                    temp_search: event.target.value
                                                })}
                                                onKeyUp={event => {
                                                    if (event.keyCode === 13) this.setState({
                                                        search: this.state.temp_search,
                                                        articles: null,
                                                    }, () => this.generateFilters());
                                                }}
                                            />
                                            <div className="input-group-append" style={{ cursor: 'pointer' }} onClick={event => this.setState({
                                                search: this.state.temp_search,
                                                articles: null,
                                            }, () => this.generateFilters())}>
                                                <span className="input-group-text">
                                                    <i className="fas fa-search" />
                                                </span>
                                            </div>
                                        </div>}
                                    {this.state.articles &&
                                        <div className="mt-3">
                                            <ArticlesFormat
                                                articles={this.state.articles.data}
                                                data={{
                                                    layout: 'large',
                                                    show_grid: 'yes',
                                                    grid: window.innerWidth >= 768 ? 3 : 2,
                                                    show_meta_info: 'yes',
                                                    show_date: 'yes',
                                                    show_thumbnail: 'yes',
                                                    show_title: 'yes',
                                                    content_display: 'excerpt',
                                                    excerpt_length: 3,
                                                }}
                                                t={t}
                                            />
                                            {(this.state.articles && this.state.articles.last_page > 0) &&
                                                <div className="d-flex justify-content-end mt-3">
                                                    <Paginate
                                                        pageCount={this.state.articles ? this.state.articles.last_page : 1}
                                                        onPageChange={selected => this.setState({
                                                            page: selected
                                                        }, () => this.generateFilters())}
                                                        initialPage={this.state.page}
                                                    />
                                                </div>}
                                        </div>}
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

export default withTranslation()(ArticleList);