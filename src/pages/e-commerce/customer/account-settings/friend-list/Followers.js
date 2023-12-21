import React from 'react';
import CustomImage, { PublicStorageFolderPath } from '../../../../../components/helpers/CustomImage';

const Followers = (props) => {

    return (
        <div>
            {props.data.length > 0 ? props.data.map((item) => (
                <div className='d-flex justify-content-between mb-3' key={item.id}>
                    <div className='d-flex align-items-center'>
                        <CustomImage
                            folder={PublicStorageFolderPath.customer}
                            style={{ width: 50, height: 50, borderRadius: "50%" }}
                            filename={item?.data_follower?.profile_picture}
                            alt={item?.data_follower?.profile_picture}
                            className='mr-3'
                        />
                        <p>{item?.data_follower?.name}</p>
                    </div>
                    {!item.is_following ?
                        <button onClick={() => props.onFollow(item?.data_follower?.id, 0, !item.is_following, "customer")} className='btn bgc-accent-color' style={{ minWidth: 200, height: 36 }}>
                            Ikuti
                        </button>
                        :
                        <button onClick={() => props.onFollow(item?.data_follower?.id, 0, !item.is_following, "customer")} className='btn bgc-color-black text-white' style={{ minWidth: 200, height: 36 }}>
                            Berhenti Ikuti
                        </button>
                    }
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
                    <center className="mt-2">Belum ada Pengikut</center>
                </div>
            }
        </div>
    );
}

export default Followers;


{/* <div className='d-flex justify-content-between'>
                        <div className='d-flex align-items-center'>
                            <img src='/images/placeholder.png' className='mr-3' style={{ width: 50, height: 50, borderRadius: "50%" }} />
                            <p>Kevin</p>
                        </div>
                        <button className='btn bgc-color-black text-white' style={{ minWidth: 200, height: 36 }}>
                            Berhenti Ikuti
                        </button>
                    </div> */}
