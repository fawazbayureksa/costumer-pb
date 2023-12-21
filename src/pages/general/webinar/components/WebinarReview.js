import React, { useState, useEffect, PureComponent } from 'react';
import { Modal } from 'react-bootstrap';
import $ from "jquery";
import update from 'immutability-helper';
import axios from "axios";
import Cookies from "js-cookie";
import CustomerRoutePath from '../../../e-commerce/customer/CustomerRoutePath';
import ErrorDiv from "../../../../components/helpers/ErrorDiv";
import SwalToast from "../../../../components/helpers/SwalToast";
import IsEmpty from "../../../../components/helpers/IsEmpty";
import { useHistory, useParams } from 'react-router-dom';
import Config from "../../../../components/axios/Config";
import { useTranslation } from 'react-i18next';
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";

const WebinarReview = (props) => {
    const [indexSpeaker, setIndexSpeaker] = useState(0);
    const [dataSpeakers, setDataSpeakers] = useState([]);
    const [speakersRating, setSpeakersRating] = useState([]);
    const [ratingObject, setRatingObject] = useState({});

    const [reviewInput, setReviewInput] = useState('');
    const [ratingInput, setRatingInput] = useState();
    const [submitting, setSubmitting] = useState();

    const history = useHistory();
    const { t } = useTranslation()

    useEffect(() => {
        getMasterData();
    }, [indexSpeaker])

    useEffect(() => {
        setArrSpeakers();
    }, [ratingInput, reviewInput])

    const getMasterData = () => {
        // console.log(props.webinarEventId)
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/rating/getMasterData`;
        let params = {
            webinar_event_id: props.webinarEventId
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        }, params
        )).then(res => {
            // console.log(res.data.data[0]);
            setDataSpeakers(res.data.data)
        }).catch(error => {
            console.error('error review masterData: ', error);
        }).finally()
    }

    const ratingProduct = (index, rating) => {
        let inputRating = {};
        
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) $(`#star-${index}-${i}`).css('color', '#F8931D    ')
            else $(`#star-${index}-${i}`).css('color', '#858585')
        }
        console.log(rating);
        setRatingInput(rating);
    }

    const resetRatingStar = (index) => {
        for (let i = 1; i <= 5; i++) {
            $(`#star-${index}-${i}`).css('color', '#858585')
        }
    }

    const setArrSpeakers = () => {
        let tempObjRating = {};
        tempObjRating.speaker_id = dataSpeakers[indexSpeaker]?.id;
        tempObjRating.rating = ratingInput;
        tempObjRating.review = reviewInput;
        // setRatingObject(tempObjRating);

        let tempArr = speakersRating;
        tempArr[indexSpeaker] = tempObjRating;
        setSpeakersRating(tempArr);
        // setRatingObject({});
        console.log(tempArr)
    }

    const nextSpeaker = () => {
        let tempIndex = indexSpeaker;
        tempIndex += 1;
        setIndexSpeaker(tempIndex);
        ratingProduct(indexSpeaker, ratingInput)
        setReviewInput('');
        // resetRatingStar(indexSpeaker+1);
    }

    const submitReview = () => {
        // if(!validate()) return
        // nextSpeaker();
        setSubmitting(true);
        setArrSpeakers();
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/rating/save`

        let params = {
            transaction_id: props.webinarTransId,
            speaker_rating: speakersRating
        }
        // console.log(params);
        // return;
        axios.post(url, params, Config({
            Authorization: 'Bearer ' + Cookies.get('token'),
        },
        )).then(res => {
            SwalToast.fire({ icon: "success", title: res.data.message })
            history.push({
                pathname: CustomerRoutePath.ACCOUNT_SETTINGS
            })
            // setSubmitting(false)
        }).catch((error) => {
            console.log(error)
            let errMsg = "Whoops, something went wrong!"
            if (error.response) {
                console.log(error.response)
                errMsg = error.response.data.message
            }
            SwalToast.fire({
                icon: 'error',
                title: errMsg
            });
        }).finally(() => {
            setSubmitting(false)
        })
    }

    return (
        <>
            <style>{`
                    .image-review {
                        width: 40%;
                    }
                    @media (max-width: 767.98px) {
                        .image-review {
                            width: 100%;
                        }
                        .review-image-girl {
                            width: 80px;
                        }
                    }
                `}</style>
            {
                <>
                    <Modal.Header  closeButton className="d-flex border-0">
                        <Modal.Title className="font-weight-bold small color-5F6C73 d-flex">Beri Ulasan</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="px-3 pb-2">        
                            <div className="row py-4">
                                <div className="col-md-12 align-items-center" style={{textAlign: 'center'}}>
                                    <CustomImage
                                        folder={PublicStorageFolderPath.cms}
                                        filename={dataSpeakers[indexSpeaker]?.image}
                                        style={{ width: 120, height: 120, borderRadius: 80 }}
                                        className="object-fit-cover"
                                    />
                                    <h5 className="accent-color">{dataSpeakers[indexSpeaker]?.name}</h5>
                                    <div>{t('webinar.review_rating_experience')} {dataSpeakers[indexSpeaker]?.name}?</div>
                                    <div className="col-md-12 align-items-center"  style={{marginLeft: '45%'}}>
                                        <div className="d-flex my-2">
                                            {
                                                [1, 2, 3, 4, 5].map(rating =>
                                                    <p
                                                        onClick={() => ratingProduct(indexSpeaker, rating)}
                                                    >
                                                        <i
                                                            id={"star-" + indexSpeaker + "-" + rating}
                                                            // id={"star-" + "-" + rating}
                                                            className="fas fa-star color-858585" />
                                                    </p>
                                                )
                                            }
                                        </div>
                                        {/* <ErrorDiv error={errors["product_rating[" + index + "]"]} style="" /> */}
                                    </div>
                                    
                                </div>
                            </div>
                            <div className="row py-4" style={{ borderTop: '1px solid #D3D3D3' }}>
                                <small className="font-weight-bold">{t('webinar.review_experience')}</small>
                                <textarea
                                    className="form-control mt-2"
                                    onChange={(e) => setReviewInput(e.target.value)}
                                    value={reviewInput}
                                />

                            </div>
                            <div className="text-right">
                            <button className="btn accent-color border-accent-color mt-4 mr-2" onClick={() => props.funcCloseModal()}>{t('forum_back')}</button>
                                {
                                    ((indexSpeaker + 1) >= dataSpeakers.length) ?
                                        <>
                                            <button className="btn bgc-accent-color mt-4"
                                                onClick={submitReview}
                                            >{t('general.send')}</button>
                                        </>
                                        :
                                        <>
                                            <button className="btn bgc-accent-color mt-4"
                                                onClick={nextSpeaker}
                                            >{t('webinar.next')}</button>
                                        </>
                                }
                                
                            </div>
                        </div>
                    </Modal.Body>
                </>
            }
        </>
    )
}

export default WebinarReview