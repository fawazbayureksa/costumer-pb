import { Suspense, PureComponent } from "react";
import { BrowserRouter, generatePath, Route, Switch } from "react-router-dom";
import Body from "./pages/cms/Body";
import Websocket from "./components/websocket/Websocket";
import './i18n';
import axios from "axios";
import Config from "./components/axios/Config";
import Cookies from "js-cookie";
import ProductList from "./pages/e-commerce/products/ProductList";
import EcommerceRoutePath from "./pages/e-commerce/EcommerceRoutePath";
import AuthRoute from "./pages/auth/AuthRoute";
import CmsRoute from "./pages/cms/CmsRoute";
import ECommerceRoute from "./pages/e-commerce/ECommerceRoute";
import CustomerRoute from "./pages/e-commerce/customer/CustomerRoute";
import LoadingProgress from "./components/helpers/LoadingProgress";
import { GeneralRoute } from "./pages/general/GeneralRoute";

export default class AppRoute extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            feature: {
                marketplace: JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE),
                forum: JSON.parse(process.env.REACT_APP_FEATURE_FORUM),
                webinar: JSON.parse(process.env.REACT_APP_FEATURE_WEBINAR)
            }
        }
    }

    componentDidMount = () => {
        this.getCustomProduct()
    }

    getCustomProduct = () => {
        if (!Cookies.get('token')) return;

        axios.get(`${process.env.REACT_APP_BASE_API_URL}cms/getCustomProductUrl`,
            Config({
                Authorization: 'Bearer ' + Cookies.get('token'),
            })).then(response => {
                this.setState({
                    custom_product_urls: response.data.data
                });
            }).catch(error => {
                console.log(error);
            }).finally(() => {
                //
            });
    }

    render() {
        return (
            <Websocket>
                <Suspense fallback={<LoadingProgress wholePage />}>
                    <BrowserRouter>
                        <Switch>
                            {AuthRoute.map((route) => (
                                <Route path={route.path} component={route.component} key={route.path} />
                            ))}
                            {CmsRoute.map((route) => (
                                <Route path={route.path} component={route.component} key={route.path} />
                            ))}
                            {this.state.feature.marketplace && ECommerceRoute.map((route) => (
                                <Route path={route.path} component={route.component} key={route.path} />
                            ))}
                            {this.state.feature.marketplace && this.state.custom_product_urls && this.state.custom_product_urls.map((route) => (
                                <Route path={EcommerceRoutePath.PRODUCTS + "/" + route.url} component={ProductList} key={EcommerceRoutePath.PRODUCTS + "/" + route.url} />
                            ))}
                            {CustomerRoute.map((route) => (
                                <Route path={route.path} component={route.component} key={route.path} />
                            ))}
                            {(this.state.feature.webinar || this.state.feature.forum) &&
                                GeneralRoute.map((route) => (<Route path={route.path} component={route.component} key={route.path} />))
                            }
                            <Route component={Body} />
                        </Switch>
                    </BrowserRouter>
                </Suspense>
            </Websocket>
        )
    }
}