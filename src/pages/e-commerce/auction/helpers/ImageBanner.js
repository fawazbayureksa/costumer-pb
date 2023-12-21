import React from 'react'
import CustomImage from '../../../../components/helpers/CustomImage'
import Search from '../../../../widgets/Search'

export default function ImageBanner({ t }) {
    return (
        <div>
            {/* <CustomImage
                style={{ width: "100%", height: 300 }}
            /> */}
            <img src={`/images/banner_auction.png`} style={{ width: "100%", height: 300 }} />
            <div className='text-center' style={{ marginTop: -150 }}>
                <h2 className='h2 font-weight-bold text-white' >
                    {t('auction.the_auction')} 365
                </h2>
                <p className='text-white'>{t('auction.give_the_high_offer')}</p>
                {/* <div className='row justify-content-center '>
                    <div class="input-group my-3 w-25">
                        <input type="text" class="form-control" placeholder="Search ..." />
                        <div class="input-group-append">
                            <button className='btn bgc-accent-color'>
                                <i className="fa fa-search" />
                            </button>
                        </div>
                    </div>
                </div> */}
                <Search type={"auction"} />
            </div>

        </div>
    )
}
