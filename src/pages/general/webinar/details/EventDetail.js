import React, { useState, useEffect } from 'react';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import MyContext from '../../../../components/MyContext';
import Template from '../../../../components/Template';
import { Tabs, Tab, Modal } from "react-bootstrap";
import TinyMceEditor, { TinyMceContent } from '../../../../components/helpers/TinyMceEditor';
import { DateTimeFormat } from '../../../../components/helpers/DateTimeFormat';
import { Link, useParams, useHistory } from 'react-router-dom';
import axios from 'axios';
import SwalToast from '../../../../components/helpers/SwalToast';
import Cookies from 'js-cookie';
import Config from '../../../../components/axios/Config';
import CurrencyFormat from '../../../../components/helpers/CurrencyFormat';
import PriceRatio from '../../../../components/helpers/PriceRatio';
import GeneralRoutePath from '../../GeneralRoutePath';
import moment from 'moment'
import ErrorDiv from '../../../../components/helpers/ErrorDiv';
import IsEmpty from '../../../../components/helpers/IsEmpty';
import AuthRoutePath from '../../../auth/AuthRoutePath';
import { isLogin } from '../../forum/components/IsLogin';
import { useTranslation } from 'react-i18next';
import { optionExpertiseLevel } from '../components/WebinarOptions';

const Styles = props => {
	if (props.themes) {
		return (
			<style>{`
              #body {
                  max-width: ${props.themes.site_width.width};
                  margin: 0 auto;
              }
              @media (max-width: 767.98px) {
                  .tab-coment {
                      display: none;
                  }                        
              }
              .float {
                  display:none
              }
              @media (max-width: 767.98px) {
                  .card-mobile {
                      display: none;
                  }                        
                  .float{
                      display:block;
                      position:fixed;
                      padding:100;
                      width:auto;
                      height:aut0;
                      bottom:40px;
                      right:40px;
                      border-radius:50px;
                      box-shadow: 1px 1px 2px #999;
                      text-align:center;
                      z-index:99
                  }

                  .my-float{
                      margin-top:20px
                  }
              }
          `}</style>
		);
	} else return null;
};

const EventDetail = () => {

    const history = useHistory()

    const { id } = useParams()
    const [dataDetail, setDataDetail] = useState()
    const [dataSpeakers, setDataSpeakers] = useState([])
    const [benefits, setBenefits] = useState([])
    const [tools, setTools] = useState([])
    const [ingredients, setIngredients] = useState([])
    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [selected, setSelected] = useState([])
    const [error, setError] = useState({})
    const [submitting, setSubmitting] = useState();

    const { t } = useTranslation();
    const currentDate = new Date(); 

    //Validation
    const [errors, setErrors] = useState({});

    const setExpLabel = (level) => {
		let result = optionExpertiseLevel.find(x=>x.value === level)
		if (result) {
			return result.label
		} else {
			return level
		}
    }

    useEffect(() => {
        getDetailSpeaker()
    }, [])

    const getDetailSpeaker = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/getEvent/detail/${id}`

        let axiosInstance = axios.get(url)
        if (isLogin()) {
            axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${Cookies?.get("token")}` }))
        }

       axiosInstance.then(response => {
            setDataDetail(response.data.data);
            setDataSpeakers(response.data.data.speakers);
            setBenefits(response.data.data.benefits);
            setTools(response.data.data.tools);
            setIngredients(response.data.data.ingredients);
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

    const validate = () => {
        let validate = true
        let errorsTemp = {};
        if(IsEmpty(name)) {
            errorsTemp.name = "Name is required";
            validate = false
        }
        if (IsEmpty(email)) {
            errorsTemp.email = 'Email is required'
            validate = false 
        } 
        // focusError(errorsTemp);
        setErrors(errorsTemp);
        return validate
    }

    const handleCheckout = () => {
        if(!validate()) return 
        // setSubmitting(true);
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/transaction/save`

        let params = {
            webinar_event_id: dataDetail.id,
            data_participant: [{
                name: name,
                email: email
            }]
        }

        axios.post(url, params, Config({
            Authorization: 'Bearer ' + Cookies.get('token'),
        },
        )).then(res => {
            SwalToast.fire({ icon: "success", title: res.data.message })
            history.push({
                pathname: GeneralRoutePath.WEBINAR_CHECKOUT_PAYMENT.replace(':invoice', res.data.data)
            });
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
			<Template>
				<MyContext.Consumer>{context => (
					<div id="body" className="my-4">
						<Styles themes={context.theme_settings} />
						<div className="row">
                            <div className='col-md-8'>
                                <div className="bg-white shadow-graph rounded p-3">
                                    <h4 className='h4 font-weight-bold color-black'>{dataDetail?.title}</h4>
                                    <CustomImage
                                        folder={PublicStorageFolderPath.cms}
                                        filename={dataDetail?.image}
                                        style={{ width: '100%', height: '100%' }}
                                        className="mt-3"
                                    />
                                    <div className="ml-1 mt-3 row">
                                        {
                                            ((moment(dataDetail?.price_sale_start).isBefore(currentDate)) && (moment(dataDetail?.price_sale_end).isAfter(currentDate))) ?
                                                <>
                                                    <div className="mt-1">
                                                        <p style={{ color: '#F8931D', backgroundColor: '#faddbb', textAlign: 'center', width: '150%', borderRadius: 50 }}>{PriceRatio(dataDetail?.price_normal, dataDetail?.price_sale)}</p>
                                                    </div>
                                                    <div className="ml-4 mt-0">
                                                        <del className='font-size-60-percent' style={{ color: 'grey' }}>Rp. {CurrencyFormat(dataDetail?.price_normal)}</del>
                                                    </div>
                                                    <div className="ml-2 mt-1">
                                                        <p className='font-weight-bold' style={{ width: 'auto' }}>Rp. {CurrencyFormat(dataDetail?.price_sale)}</p>
                                                    </div>
                                                </> :
                                                <>
                                                    <div className="mt-1">
                                                        <p className='font-weight-bold' style={{ width: 'auto' }}>Rp. {CurrencyFormat(dataDetail?.price_normal)}</p>
                                                    </div>
                                                </>
                                        }                                      
                                    </div>
                                    <div className="ml-1 mt-2 row">
                                        <div className="d-flex ml-1">
                                            <i className="fas fa-calendar mr-1 mt-1 font-size-80-percent"  style={{ color: 'black' }}></i>
                                            <p className='font-size-80-percent'>{DateTimeFormat(dataDetail?.event_date, 0)}</p>
                                        </div>
                                        <div className="d-flex ml-4">
                                            <i className="fas fa-clock mr-1 mt-1 font-size-80-percent"  style={{ color: 'black' }}></i>
                                            <p className='font-size-80-percent'>{DateTimeFormat(dataDetail?.event_date, -1)}</p>
                                        </div>
                                    </div>
                                    <div className="d-flex ml-2 mt-2">
                                        <i className="fas fa-map-marker-alt mr-1 mt-1 font-size-80-percent"  style={{ color: 'black' }}></i>
                                        <p className='font-size-80-percent'>{dataDetail?.venue}</p>
                                    </div>
                                    <div className='mt-4 ml-2'>
                                        <p className='font-weight-bold font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.level')}: </p>
                                        <p className='font-size-80-percent' style={{ width: 'auto' }}>{setExpLabel(dataDetail?.event_level)} </p>
                                    </div>
                                    <div className='mt-4 ml-2'>
                                        <p className='font-weight-bold font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.description')}: </p>
                                        <TinyMceContent className='body color-black font-size-80-percent'>
                                            {dataDetail?.description}
                                        </TinyMceContent>
                                    </div>
                                </div>

                                <div className="bg-white shadow-graph rounded p-3 mt-3">
                                    <h5 className='h5 font-weight-bold color-black ml-2'>{t('webinar.featured_speaker')}</h5>
                                    <div className='row mt-2'>
                                        {dataSpeakers.map((speaker) => {
                                            return (
                                                <div className="col-md-6 row">
                                                    <div className="col-md-3">
                                                        <CustomImage
                                                            folder={PublicStorageFolderPath.cms}
                                                            filename={speaker?.speaker.image}
                                                            style={{ width: 80, height: 80, borderRadius: 50 }}
                                                            className="object-fit-cover"
                                                        />
                                                    </div> 
                                                    <div className='col-md-9'>
                                                        <p className='font-size-80-percent font-weight-bold mt-2' style={{ width: 'auto' }}>{speaker?.speaker.name}</p>
                                                        <p className='font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.specialityIn')} {speaker?.speaker.expertise}</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="bg-white shadow-graph rounded p-3 mt-3">
                                    <h5 className='h5 font-weight-bold color-black ml-2'>{t('webinar.detail')}</h5>
                                    <div className="mt-3 ml-2">
                                        <p className='font-weight-bold font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.registration_deadline')}: </p>
                                        <p className='font-size-80-percent'>{DateTimeFormat(dataDetail?.max_reg_date, 0)}</p>
                                    </div>
                                    <div className="ml-2">
                                        <div className="mt-3 row">
                                            <div className="col-xl-4" style={{ top: 0 }}>
                                                <p className='font-weight-bold font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.tools')}: </p>
                                                {tools.map((tool) => {
                                                    return (
                                                        <div className="d-flex">
                                                            <i className="fas fa-check-circle mr-1 mt-1 font-size-80-percent" style={{ color: '#F8931D' }}></i>
                                                            <p className='font-size-80-percent'>{tool.name}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="col-xl-4" style={{ top: 0 }}>
                                                <p className='font-weight-bold font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.ingredients')}: </p>
                                                {ingredients.map((ingredient) => {
                                                    return (
                                                        <div className="d-flex">
                                                            <i className="fas fa-check-circle mr-1 mt-1 font-size-80-percent" style={{ color: '#F8931D' }}></i>
                                                            <p className='font-size-80-percent'>{ingredient.name}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            <div className="col-xl-4" style={{ top: 0 }}>
                                                <p className='font-weight-bold font-size-80-percent' style={{ width: 'auto' }}>{t('webinar.benefit')}: </p>
                                                {benefits.map((benefit) => {
                                                    return (
                                                        <div className="d-flex">
                                                            <i className="fas fa-check-circle mr-1 mt-1 font-size-80-percent" style={{ color: '#F8931D' }}></i>
                                                            <p className='font-size-80-percent'>{benefit.name}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className='col-sm-12 col-md-4'>
                                <div className="bg-white shadow-graph rounded p-3 " style={{ top: 0 }}>
                                    <div className='align-items-center'>
                                        {
                                            (moment(dataDetail?.max_reg_date).isBefore(currentDate)) ?
                                                <>
                                                    <h5 className='font-weight-bold' style={{ textAlign: 'center' }}>{t('webinar.not_available')}</h5>
                                                </> :
                                                (isLogin(id) === true) ?
                                                    (dataDetail?.webinar_transaction?.last_status?.mp_transaction_status_master_key === "complete") ?
                                                        <>
                                                            <h5 className='font-weight-bold' style={{ textAlign: 'center' }}>{t('webinar.event_has_been_purchased')}</h5>
                                                        </>:
                                                        <>
                                                            <h5 className='font-weight-bold' style={{ textAlign: 'center' }}>{t('webinar.buy_ticket_event')}</h5>
                                                            <h6 className='font-weight-bold mt-4'>{t('webinar.participant_data')}</h6>
                                                            <p className='font-size-80-percent mt-2'>{t('webinar.participant_name')}:</p>
                                                            <input type="text" className="form-control" name="name" onChange={(e) => setName(e.target.value)} required />
                                                            <ErrorDiv error={errors.name} />
                                                            <p className='font-size-80-percent mt-2'>{t('webinar.participant_email')}:</p>
                                                            <input type="text" className="form-control" name="email" onChange={(e) => setEmail(e.target.value)} required />
                                                            <ErrorDiv error={errors.email} />
                                                            <Link className="text-decoration-none color-F8931D my-2 card-mobile" onClick={() => handleCheckout()}>
                                                                <button className="btn btn-sm text-white bgc-accent-color button-nowrap rounded p-2 font-weight-bold mb-3 w-100 mt-3" >
                                                                    {t('webinar.proceed_to_buy')}
                                                                </button>
                                                            </Link>
                                                        </> :
                                                    <>
                                                        <h6 className='font-weight-bold mt-4'>{t('webinar.login_for_register')}</h6>
                                                        <Link className="text-decoration-none color-F8931D my-2 card-mobile" to={AuthRoutePath.LOGIN}>
                                                            <button className="btn btn-sm text-white bgc-accent-color button-nowrap rounded p-2 font-weight-bold mb-3 w-100 mt-3" >
                                                                Login
                                                            </button>
                                                        </Link>
                                                    </>
                                        }
                                    </div>
                                </div>
                            </div>		
						</div>
					</div>
				)}</MyContext.Consumer>
			</Template>
		</>
	);
}

export default EventDetail