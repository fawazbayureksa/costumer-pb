import React, { useState, useEffect } from 'react';
import CustomImage, { PublicStorageFolderPath } from '../../../../components/helpers/CustomImage';
import MyContext from '../../../../components/MyContext';
import Template from '../../../../components/Template';
import { Tabs, Tab, Modal } from "react-bootstrap";
import TinyMceEditor, { TinyMceContent } from '../../../../components/helpers/TinyMceEditor';
import EventCard from '../components/EventCard';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import SwalToast from '../../../../components/helpers/SwalToast';
import Cookies from 'js-cookie';
import Config from '../../../../components/axios/Config';
import Paginate from '../../../../components/helpers/Paginate';
import { optionExpertiseLevel } from '../components/WebinarOptions';
import { isLogin } from '../../forum/components/IsLogin';
import { useTranslation } from 'react-i18next';
import SpeakerListReview from '../components/SpeakerListReview';
import SpeakerDiscussion from '../components/SpeakerDiscussion';

const Styles = props => {
  if (props.themes) {
      return (
          <style>{`
              #body {
                  max-width: ${props.themes.site_width.width};
                  margin: 0 auto;
              }
              .nav-tabs .nav-link {
                  border: none;
                  margin-left : 2rem;
                  margin-right: 2rem;
              }
              .nav-tabs .nav-link.active {
                  border-bottom: 2px solid ${props.themes ? props.themes.accent_color.value : ''};
                  color:#F8931D;
                  font-weight:700;  
                  
              }
              .nav-tabs .nav-item.show .nav-link, .nav-tabs .nav-link.active {
                  color: ${props.themes ? props.themes.accent_color.value : ''};
                  font-weight:700;  
              }
              .nav-tabs a{
                  font-size: 18px;
              }
              .nav-tabs a:hover {
                  color: ${props.themes ? props.themes.accent_color.value : ''};
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


const SpeakerDetail = () => {
	const { id } = useParams()
    const [dataDetail, setDataDetail] = useState()
    const [error, setError] = useState({})

    const [key, setKey] = useState('biografi');
	
	const [loading, setLoading] = useState(false);
	const [events, setEvents] = useState([]);
    const [page_count, set_page_count] = useState(0);
    const [page, set_page] = useState(1);
    const [perPage, setPerPage] = useState(6);

    const { t } = useTranslation()

    useEffect(() => {
        getDetailSpeaker()
    }, [])

    useEffect(() => {
        getEventList()
    }, [page, dataDetail])

    const getDetailSpeaker = () => {
        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/getSpeaker/detail/${id}`
        axios.get(url, Config({
            Authorization: `Bearer ${Cookies.get("token")}`,
        })).then(response => {
            setDataDetail(response.data.data);
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

    const getEventList = () => {
        if (!dataDetail)
        return;

        let url = `${process.env.REACT_APP_BASE_API_URL}webinar/getEvent`;
        let params = {
            page: page,
            per_page: perPage,
            webinar_speaker_id: dataDetail?.id
        }
        axios.get(url, Config({
            Authorization: 'Bearer ' + Cookies.get('token')
        }, params
        )).then(res => {
            setEvents(res.data.data.data);
            set_page_count(res.data.data.last_page)
            console.log(res.data.data.data);
        }).catch(error => {
            console.error('error banner: ', error);
        }).finally(() => setLoading(false))
    }

    const onPageChange = (page) => {
        set_page(page)
    }

    const setExpLabel = (level) => {
		let result = optionExpertiseLevel.find(x=>x.value === level)
		if (result) {
			return result.label
		} else {
			return level
		}
    }

    return (
        <>
            <Template>
                <MyContext.Consumer>{context => (
                    <div id="body" className="my-4">
                        <Styles themes={context.theme_settings} />
                        <div className="row">
                            <div className='col-md-12'>
                                <div className="bg-white shadow-graph rounded p-3 " style={{ top: 0 }}>
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className='col-md-7 d-flex'>
                                            <div>
                                                <CustomImage
                                                    folder={PublicStorageFolderPath.cms}
                                                    filename={dataDetail?.image}
                                                    style={{ width: 80, height: 80, borderRadius: 50 }}
                                                    className="object-fit-cover"
                                                />
                                            </div>
                                            <div className='align-self-center ml-3'>
												<div className='d-flex'>
													<h6 className='h6 font-weight-bold color-black'>{dataDetail?.name}</h6>
													<div className='d-flex ml-3' style={{backgroundColor: '#F8931D', textAlign: 'center', borderRadius: 50}}>
														<i className="fas fa-crown mt-1 ml-2 mr-1"  style={{ color: 'white' }}></i>
														<p className='small mr-3' style={{ color: 'white' }}>{setExpLabel(dataDetail?.expertise_level)}</p>
													</div>
												</div>
                                                <p className='small'>{t('webinar.specialityIn')} {dataDetail?.expertise}</p>
                                            </div>
                                        </div>
										<div className='col-md-3 d-flex'>
											<h6 className='h6 font-weight-bold color-black'>{t('webinar.classes')}</h6>
										</div>
                                        <div className='col-md-2 column'>
                                            <h6 className='h6 font-weight-bold color-black'>{t('webinar.rating')}</h6>
                                            <div className="mt-2 row">
                                                {
                                                    (dataDetail?.rating) &&
                                                    <>
                                                        <p className="font-size-80-percent mr-2 color-FFB200" style={{ width: 'auto' }}>{dataDetail?.rating}</p>
                                                        <div className="d-flex">
                                                            {[1, 2, 3, 4, 5].map(rating =>
                                                                rating <= dataDetail?.rating ? <i className="fas fa-star color-FFB200" /> : <i className="fas fa-star color-858585" />
                                                            )}
                                                        </div>
                                                    </>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='mt-4'>
                                    <div className=''>
                                        {(dataDetail !== null) &&
                                            <Tabs id="controlled-tab" className="mb-3" activeKey={key} onSelect={(k) => setKey(k)}>
                                                <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4" eventKey="biografi" title="Biografi">
                                                    <div className='shadow-graph'>
                                                        <TinyMceContent className='body color-black m-4'>
                                                            {dataDetail?.bio}
                                                        </TinyMceContent>
                                                    </div>
                                                </Tab>
                                                {/* <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="terbaru" title={t('forum_latest')}>
                                            </Tab> */}
                                                <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="ulasan" title="Ulasan">
                                                    {
                                                        (dataDetail) &&
                                                        <>
                                                            <SpeakerListReview
                                                                type={'type_1'}
                                                                speakerDetail={dataDetail}
                                                            />
                                                        </>
                                                    }
                                                    
                                                </Tab>
                                                <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="diskusi" title="Diskusi">
                                                    {
                                                        (dataDetail) &&
                                                        <>
                                                            <SpeakerDiscussion
                                                                speakerDetail={dataDetail}
                                                            />
                                                        </>
                                                    }    
                                                </Tab>
                                                <Tab tabClassName="mx-0 mx-sm-0 mx-md-3 mx-4 " eventKey="event" title="Kelas">
                                                    <div className='row'>
                                                        {events.map((event) => {
                                                            console.log(event.speakers)
                                                            return (
                                                                <EventCard event={event} />
                                                            )
                                                        })}
                                                    </div>
                                                    <Paginate pageCount={page_count} onPageChange={onPageChange} initialPage={page} />
                                                </Tab>
                                            </Tabs>
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


export default SpeakerDetail