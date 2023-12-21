import axios from 'axios';
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Config from '../../../../../components/axios/Config';
import IsEmpty from '../../../../../components/helpers/IsEmpty';
import CardSlider from '../../../auction/components/CardSlider';
import Card from './components/Card';

const Auction = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [search, setSearch] = useState('')

    const [lastPage, setLastPage] = useState();
    const [currentPage, setCurrentPage] = useState(1);
    useEffect(() => {
        getDataWhislist()
    }, [])

    const getDataWhislist = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}my-wishlist/get?type=auction`
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get('token')}`
        })).then(response => {
            if (!IsEmpty(response.data.data)) {
                setData(response.data.data.data)
            }
        }).catch(error => {
            console.log(error.response.data.message);
        }).finally(() => {
            //
        });
    }
    const { t } = useTranslation()

    return (
        <div>
            <div className="bg-white shadow-graph rounded p-3">
                <div className="row mt-3">
                    <div className="col-12 col-sm-12 col-md-12 col-lg-12 col-xl-12">
                        <div className="d-flex search p-0 form-control">
                            <input type="text" className="border-0 w-100 p-2"
                                placeholder='Cari produk lelang'
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                            <div className="ml-auto py-1 px-3 bgc-accent-color" style={{ borderTopRightRadius: 4, borderBottomRightRadius: 4 }}
                            // onClick={this.setUrlParams}
                            >

                                <i className="fa fa-search text-white" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="">
                    <Card data={data} t={t} />
                </div>
            </div >
        </div >
    );
}

export default Auction;
