import ArticleDetail from "./article/ArticleDetail";
import ArticleList from "./article/ArticleList";
import CmsRoutePath from "./CmsRoutePath";

const CmsRoute = [
    {path: CmsRoutePath.ARTICLE_SLUG, component: ArticleDetail},
    {path: CmsRoutePath.ARTICLES, component: ArticleList},
];

export default CmsRoute;