import React, { PureComponent } from 'react';
import Template from "../../../../components/Template";
import { withTranslation } from "react-i18next";
import Cookie from 'js-cookie';
import IsEmpty from "../../../../components/helpers/IsEmpty";
import AuthRoutePath from "../../../auth/AuthRoutePath";
import MyContext from "../../../../components/MyContext";
import { Link, NavLink, Redirect, Route, Switch } from "react-router-dom";
import CustomerRoutePath from "../CustomerRoutePath";
import MyAccount from "./my-account/MyAccount";
import Inbox from "./inbox/Inbox";
import MyOrders from "./my-orders/MyOrders";
import MyOrdersDetail from "./my-orders/MyOrdersDetail";
import MyPaymentDetail from './my-orders/MyPaymentDetail';
import Wishlist from "./wishlist/Wishlist";
import MyVouchers from "./my-vouchers/MyVouchers";
import AddressList from './AddressList';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import Membership from "./my-account/membership/membership"
import axios from 'axios';
import Config from '../../../../components/axios/Config';
import Cookies from 'js-cookie';
import SwalToast from '../../../../components/helpers/SwalToast';
import { data } from 'jquery';
import NumberFormat from 'react-number-format';
import { CurrencyFormat2 } from '../../../../components/helpers/CurrencyFormat';
import TabWishlist from './wishlist/TabWishlist';
import TabAuction from './auction/TabAuction';
import TicketList from './webinar-tickets/TicketList';
import TabFriend from './friend-list/TabFriend';
import MetaTrigger from '../../../../components/MetaTrigger';

const Style = props => {
    if (props.themes) {
        return (
            <style>{`
                #account-settings {
                    max-width: ${props.themes.site_width.width};
                    margin: 0 auto;
                }
            `}</style>
        );
    } else return null;
};

class AccountSettings extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            new_message_count: 0,
            feature: {
                marketplace: JSON.parse(process.env.REACT_APP_FEATURE_MARKETPLACE)
            },
            data: [],
            data_membership: []
        };

        if (IsEmpty(Cookie.get('token'))) {
            this.props.history.push({
                pathname: AuthRoutePath.LOGIN,
                search: `from=${this.props.location.pathname}`
            });
        }
    }

    componentDidMount() {
        this.getData();
    }

    getData = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}membership/getLevelAndPoint`;

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            this.setState({
                data: response.data.data
            })
        }).catch(error => {
            console.log(error);
        }).finally(() => {
            //
        });
    }




    render() {
        const { t } = this.props;
        const path_split = this.props.location.pathname.split('/');
        const last_path = IsEmpty(path_split[2]) ? 'account_settings' : path_split[2].replaceAll('-', '_');
        return (
            <Template>
                <style>{`
                    @media (max-width: 767.98px) {
                        .account-setting-menu {
                            display: none;
                        }
                    }
                `}</style>
                <MyContext.Consumer>{context => (
                    <>
                        <MetaTrigger
                            pageTitle={context.companyName ? `${t('account_setting')} - ${context.companyName} ` : ""}
                            pageDesc={t('account_setting')}
                        />
                        <div id="account-settings" className="my-4">
                            <Style themes={context.theme_settings} />
                            <div className="text-center">
                                <p className="m-0 font-weight-semi-bold accent-color ">{t('account_setting')} / {t(`account_setting.${last_path === 'account_settings' ? 'my_account' : last_path}`)} {!IsEmpty(path_split[4]) && ` / ${path_split[4]}`}</p>
                            </div>
                            <div className="row no-gutters mt-3">
                                <div className="col-12 col-sm-12 col-md-3 col-lg-3 col-xl-3 pr-0 pr-sm-0 pr-md-2 pr-lg-2 pr-xl-2 account-setting-menu">
                                    {/* <div className="bg-white shadow-graph rounded p-3">
                                    <NavLink exact to={CustomerRoutePath.ACCOUNT_SETTINGS} className="text-decoration-none color-5E666E" activeClassName="accent-color">
                                        <p className="mb-2 small font-weight-semi-bold">{t('account_setting.my_account')}</p>
                                    </NavLink>
                                    {this.state.feature.marketplace && <>
                                        <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_INBOX} className="text-decoration-none color-5E666E" activeClassName="accent-color">
                                            <p className="mb-2 small font-weight-semi-bold">{t('account_setting.inbox')} ({this.state.new_message_count})</p>
                                        </NavLink>
                                        <NavLink exact to={CustomerRoutePath.ACCOUNT_SETTINGS_ADDRESS} className="text-decoration-none color-5E666E" activeClassName="accent-color">
                                            <p className="mb-2 small font-weight-semi-bold">{t('account_setting.address')}</p>
                                        </NavLink>
                                        <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} className="text-decoration-none color-5E666E" activeClassName="accent-color">
                                            <p className="mb-2 small font-weight-semi-bold">{t('account_setting.my_orders')}</p>
                                        </NavLink>
                                        <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_WISHLIST} className="text-decoration-none color-5E666E" activeClassName="accent-color">
                                            <p className="mb-2 small font-weight-semi-bold">{t('account_setting.wishlist')}</p>
                                        </NavLink>
                                        <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_VOUCHERS} className="text-decoration-none color-5E666E" activeClassName="accent-color">
                                            <p className="m-0 small font-weight-semi-bold">{t('account_setting.my_vouchers')}</p>
                                        </NavLink>
                                    </>}
                                </div> */}
                                    <div className="bg-white shadow-graph rounded p-3 position-sticky" style={{ top: 0 }}>
                                        {!IsEmpty(Cookie.get('user')) &&
                                            <div className="d-flex">
                                                <div>
                                                    <CustomImage filename={JSON.parse(Cookie.get('user')).profile_picture} folder={PublicStorageFolderPath.customer} className="mr-3" style={{ width: 50, height: 50, borderRadius: 50 }} />
                                                </div>
                                                <div>
                                                    <p className='font-weight-semi-bold'>{JSON.parse(Cookie.get('user')).name}</p>
                                                    <Link to={CustomerRoutePath.ACCOUNT_SETTINGS_MEMBERSHIP} style={{ fontSize: 12 }}>
                                                        {this.state.data && `${this.state.data?.levelName} ( ${CurrencyFormat2(this.state.data?.currentLoyaltyPoint)})`}
                                                    </Link>
                                                </div>
                                            </div>
                                        }
                                        <NavLink exact to={CustomerRoutePath.ACCOUNT_SETTINGS} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                            <div className="d-flex border-bottom py-3">
                                                <p className="mb-2 small font-weight-semi-bold">{t('account_setting.my_account')}</p>
                                                <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                            </div>
                                        </NavLink>
                                        {this.state.feature.marketplace && <>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_INBOX} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex border-bottom py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.inbox')}  ({this.state.new_message_count})</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink exact to={CustomerRoutePath.ACCOUNT_SETTINGS_ADDRESS} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex border-bottom py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.address')}</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex border-bottom py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.my_orders')}</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_WISHLIST} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex border-bottom py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.wishlist')}</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_AUCTION} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex border-bottom py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.auction')}</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_WEBINAR_TICKET_LIST} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex border-bottom py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">Webinar Tickets</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_MY_VOUCHERS} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.my_vouchers')}</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                            <NavLink to={CustomerRoutePath.ACCOUNT_SETTINGS_FRIEND_LIST} className="text-decoration-none color-5E666E" activeClassName="font-weight-semi-bold accent-color">
                                                <div className="d-flex py-3">
                                                    <p className="mb-2 small font-weight-semi-bold">{t('account_setting.friend_list')}</p>
                                                    <div className="ml-auto"><i className="fas fa-angle-right" /></div>
                                                </div>
                                            </NavLink>
                                        </>}
                                    </div>
                                </div>
                                <div className="col-12 col-sm-12 col-md-9 col-lg-9 col-xl-9 pl-0 pl-sm-0 pl-md-2 pl-lg-2 pl-xl-2">
                                    <Switch>
                                        <Route exact path={CustomerRoutePath.ACCOUNT_SETTINGS} component={MyAccount} />
                                        {this.state.feature.marketplace && <>
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_INBOX} component={Inbox} />
                                            <Route exact path={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS} component={MyOrders} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_MY_ORDERS_DETAIL} component={MyOrdersDetail} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_MY_PAYMENT_DETAIL} component={MyPaymentDetail} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_WISHLIST} component={TabWishlist} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_MY_VOUCHERS} component={MyVouchers} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_ADDRESS} component={AddressList} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_AUCTION} component={TabAuction} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_WEBINAR_TICKET_LIST} component={TicketList} />
                                            <Route path={CustomerRoutePath.ACCOUNT_SETTINGS_FRIEND_LIST} component={TabFriend} />
                                        </>}
                                        <Redirect to={CustomerRoutePath.ACCOUNT_SETTINGS} />
                                    </Switch>
                                </div>
                            </div>
                        </div>
                    </>
                )}</MyContext.Consumer>
            </Template>
        );
    }
}

export default withTranslation()(AccountSettings);