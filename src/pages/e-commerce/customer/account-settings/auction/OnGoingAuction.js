import Cookies from 'js-cookie';
import React, { useEffect } from 'react';
import { useState } from 'react';
import Config from '../../../../../components/axios/Config';
import SwalToast from '../../../../../components/helpers/SwalToast';
import axios from 'axios'
import CardAuction from '../../../auction/components/CardAuction';


const OnGoingAuction = () => {
    const [data, setData] = useState([])


    useEffect(() => {
        getData();
    }, [])

    const getData = () => {

        let url = `${process.env.REACT_APP_BASE_API_URL}auction/product/ongoing`

        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            let data = response.data.data;
            setData(data);
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


    return (
        <div>
            <style>{`
                    .vouchers {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .empty-state {
                        width: 300px;
                    }
                    .card-slider {
                        display: grid;
                        grid-template-rows: 1fr 1fr;
                        gap: 15px;
                    }
                    .show-history{
                        font-size:16px;
                    }
                    .hr34 {
                        margin-top:35px
                    }
                    @media (max-width: 765.98px) {
                        .empty-state {
                            width: 200px;
                        }
                        .vouchers {
                            display: grid;
                            grid-template-columns: 1fr;
                            gap: 10px;
                        }
                        .show-history{
                            display:none;
                        }
                        .iconafd{
                            font-size:20px;
                        }
                        .container {
                            padding:0;
                        }
                    }
                    @media (max-width: 425px) {
                        .responsive-card{
                            display:flex;
                            flex-direction:column;
                            
                        }
                        .button-exchange {
                            display:flex;
                            align-self:start;
                        }
                    }
                `}</style>
            {data.length > 0 ?
                <div className='vouchers'>
                    {data.map((item) => (
                        <CardAuction data={item} />
                    ))}
                </div>
                :
                <div className="">
                    <div className="d-flex justify-content-center">
                        <img
                            src={`/images/empty-product.png`}
                            className="empty-state w-25"
                            onError={event => event.target.src = `/images/placeholder.gif`}
                        />
                    </div>
                    <center className="mt-2">Belum ada lelang yang berlangsung</center>
                </div>
            }
        </div>
    );
}

export default OnGoingAuction;
