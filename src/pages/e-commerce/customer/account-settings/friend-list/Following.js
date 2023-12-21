import React from 'react';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';

const Following = (props) => {

    return (
        <div>
            {props.data && props.data.length > 0 ? props.data.map((item) => (
                <div className='d-flex justify-content-between mb-3'>
                    <div className='d-flex align-items-center'>
                        <CustomImage
                            folder={item.type === "seller" ? PublicStorageFolderPath.seller : PublicStorageFolderPath.customer}
                            style={{ width: 50, height: 50, borderRadius: "50%" }}
                            filename={item.profile_picture}
                            alt={item.profile_picture}
                            className='mr-3'
                        />
                        <p>{item.name}</p>
                    </div>
                    <button onClick={() => props.onFollow(item?.mp_customer_id, item?.mp_seller_id, item.is_following, item.type)} className='btn bgc-color-black text-white' style={{ minWidth: 200, height: 36 }}>
                        Berhenti Ikuti
                    </button>
                </div>
            ))
                :
                <div className="">
                    <div className="d-flex justify-content-center">
                        <img
                            src={`/images/empty_state.png`}
                            className="empty-state w-25"
                            onError={event => event.target.src = `/images/placeholder.gif`}
                        />
                    </div>
                    <center className="mt-2">Belum ada diikuti</center>
                </div>
            }
        </div>
    );
}

export default Following;
