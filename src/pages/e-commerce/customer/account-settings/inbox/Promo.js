import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';

const Promo = (props) => {

    useEffect(() => {
        console.log(props)
        getMasterData()
    }, [])
    const getMasterData = () => {
        console.log("test")
    }
    const { t } = props;

    return (
        <>
            <style>{`
            .empty-state {
                width: 300px;
            }
            @media (max-width: 765.98px) {
                .empty-state {
                    width: 200px;
                }
            }
        `}</style>
            <div className="col-12 p-5">
                <div className="d-flex justify-content-center">
                    <img
                        src={`/images/empty_state.png`}
                        className="empty-state"
                        onError={event => event.target.src = `/images/placeholder.gif`}
                    />
                </div>
                <center className="mt-2">{t("account_setting.no_promo")}</center>
            </div>
        </>
    )
}

export default withTranslation()(Promo)