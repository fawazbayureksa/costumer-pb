import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import EcommerceRoutePath from "../pages/e-commerce/EcommerceRoutePath";
import CmsRoutePath from "../pages/cms/CmsRoutePath";

const types = [
    { value: EcommerceRoutePath.PRODUCTS, label: 'Product' },
    { value: EcommerceRoutePath.SELLER_LIST, label: 'Seller' },
    { value: CmsRoutePath.ARTICLES, label: 'Article' },
];

/**
 * 
 * @param {object} data data for this component
 */
const Search = (props) => {
    const history = useHistory();
    const location = useLocation()
    const urlSearchParams = new URLSearchParams(location.search)

    const [styles, set_styles] = useState({});
    const [type, set_type] = useState(types.find(x => x.value === location.pathname) || types[0]);
    const [search, set_search] = useState(urlSearchParams.get('search') || '');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [name, set_name] = useState('')

    const responsiveView = () => {
        let widthOfWindow = window.innerWidth;
        setWindowWidth(widthOfWindow);
    }

    useEffect(() => {
        setStyle();
        window.addEventListener('resize', responsiveView);
        return () => {
            window.removeEventListener('resize', responsiveView);
        };
    }, []);

    const setStyle = () => {
        let temp_styles = {};
        temp_styles.width = windowWidth <= 767 ? '100%' : props?.data?.width;
        temp_styles.marginTop = props?.data?.margin_top || 0;
        temp_styles.marginBottom = props?.data?.margin_bottom || 0;
        temp_styles.marginRight = props?.data?.margin_right || 0;
        temp_styles.marginLeft = props?.data?.margin_left || 0;
        set_styles(temp_styles);
    }

    const onChange = (event) => {
        let data = event.target.value;
        let type = event.target.name;
        set_name(type)
        set_search(data);
    }

    const onKeyup = (event) => {
        if (event.keyCode === 13) {
            searching()
        }
    }

    const searching = () => {
        if (!type) return;

        history.push({
            pathname: type.value,
            search: `search=${search}&type=${name}`
        });
    }


    const onTypeChange = (e) => {
        let chosen = types.find(x => x.value === e.target.value)
        set_type(chosen)
    }

    return (
        <>
            {props?.data?.type &&
                <div>
                    {props.data.type == "type_1" &&
                        <div style={styles} className="d-flex align-items-center border rounded py-0 py-sm-0 py-md-1 py-lg-1 py-xl-1">
                            <div className="border-right pr-1">
                                <select className="form-control-sm border-0 " onChange={onTypeChange} value={type?.value}>
                                    {types.map((type) => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </div>
                            <input
                                type="text"
                                className="form-control-sm w-100 border-0"
                                placeholder={props.data.placeholder || ''}
                                value={search}
                                onChange={onChange}
                                onKeyUp={onKeyup}
                            />
                        </div>}

                    {props.data.type == "type_2" &&
                        <div style={styles} className="d-flex search p-0 form-control">
                            <select className="form-control-sm  h-100 border-left-0 border-top-0 border-bottom-0 border-right" onChange={onTypeChange} value={type?.value}>
                                {types.map((type) => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            <input type="text" className="border-0 w-100 p-2" value={search} onChange={onChange} onKeyUp={onKeyup} />
                            <div className="ml-auto py-1 px-3 bgc-accent-color" style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }} onClick={searching}>
                                <i className="fa fa-search text-white" />
                            </div>
                        </div>
                    }
                </div>
            }
            {props.type == "auction" &&
                <div className='row justify-content-center '>
                    <div class="input-group my-3 w-25">
                        <input
                            name="auction"
                            type="text"
                            class="form-control"
                            placeholder="Search ..."
                            value={search}
                            onChange={onChange}
                            onKeyUp={onKeyup}
                        />
                        <div class="input-group-append">
                            <button className='btn bgc-accent-color' onClick={searching}>
                                <i className="fa fa-search" />
                            </button>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default Search