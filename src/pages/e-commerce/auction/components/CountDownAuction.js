import React from 'react';
import Countdown from 'react-countdown';

export const CountdownAuction = ({ targetDate, t, type }) => {

    return (
        <div className='d-flex justify-content-center'>
            <div className='shadow-graph bg-white p-2 text-center position-absolute' style={{ top: "45%", width: "80%", height: "20%" }}>
                <p className='font-size-90-percent font-weight-bold text-dark'>
                    {type === "start_in" ? t('auction.start_id') : t('auction.ends_id')} :
                </p>
                <Countdown
                    date={targetDate}
                    renderer={({ days, hours, minutes, seconds }) => (
                        <div className='d-flex text-danger'>
                            <p className='font-size-80-percent'>
                                <strong className='font-weight-bold'>{days} </strong>
                                {t('auction.day')}
                            </p>
                            <p>|</p>
                            <p className='font-size-80-percent'>
                                <strong className='font-weight-bold'>{hours} </strong>
                                {t('auction.hour')}
                            </p>
                            <p>|</p>
                            <p className='font-size-80-percent'>
                                <strong className='font-weight-bold'>{minutes} </strong>
                                {t('auction.minute')}
                            </p>
                            <p>|</p>
                            <p className='font-size-80-percent'>
                                <strong className='font-weight-bold'>{seconds} </strong>
                                {t('auction.second')}
                            </p>
                        </div>
                    )}
                />
            </div>
        </div>
    );
};

