import React, { createRef, useState, useEffect, useRef } from "react";
import axios from "axios"
import Cookies from "js-cookie"
import TextTruncate from "../../../../components/helpers/TextTruncate";
import GeneralRoutePath from "../../GeneralRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";
import PriceRatio from "../../../../components/helpers/PriceRatio";
import CurrencyFormat from "../../../../components/helpers/CurrencyFormat";
import moment from "moment";
import { TinyMcePreview } from "../../../../components/helpers/TinyMceEditor";
import { optionEventType, optionExpertiseLevel } from "../components/WebinarOptions"
import context from "react-bootstrap/esm/AccordionContext";
import { Link, NavLink, Redirect, Route, Router, Switch, useHistory } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const Styles = props => {
    if (props.themes) {
        return (
			<style>{`
				
				}
            `}</style>
        );
    } else return null;
};

const EventCard = ({event}) => {

	const setOptionLabel = (val, option) => {
		let result = option.find(x=>x.value === val)
		if (result) {
			return result.label
		} else {
			return val
		}
		
    }

	const { t } = useTranslation()
	const currentDate = new Date(); 

	return (
		<div className="bg-white p-3 mb-3 col-xl-4 position-relative">
			<Styles themes={context.theme_settings} />
			<Link to={GeneralRoutePath.WEBINAR_DETAIL_EVENT.replace(':id', event.id)} className='text-decoration-none'>
				{/* <Link to={GeneralRoutePath.FORUM_DETAIL_THREAD.replace(':id', 27)} className='text-decoration-none'> */}
				<CustomImage
					folder={PublicStorageFolderPath.cms}
					filename={event?.image}
					style={{ width: '100%', height: 150 }}
					className="object-fit-cover"
				/>
				<div className="bg-white position-relative shadow-graph rounded p-2" style={{height: '69%'}}>
					<div className="ml-1 row" style={{marginBottom: 0}}>
						<div className="ml-0">
							<p className="m-0" style={{ color: '#F8931D', backgroundColor: '#faddbb', textAlign: 'center', width: '110%', borderRadius: 5 }}>{setOptionLabel(event.event_type, optionEventType)}</p>
						</div>
						<div className="ml-3">
							<p className="m-0" style={{ color: '#1DA1F2', backgroundColor: '#a8d5f1', textAlign: 'center', width: '110%', borderRadius: 5 }}>{setOptionLabel(event.event_level, optionExpertiseLevel)}</p>
						</div>
					</div>
					<TextTruncate lineClamp={2}>
						<p className='font-weight-bold ml-1 mt-1' style={{ fontSize: '110%', marginBottom: 0 }}>{event.title}</p>
					</TextTruncate>
					<div className="ml-1 row">
						{
							((moment(event.price_sale_start).isBefore(currentDate)) && (moment(event.price_sale_end).isAfter(currentDate))) ?
								<>
									<div className="mt-1">
										<p style={{ color: '#F8931D', backgroundColor: '#faddbb', textAlign: 'center', width: '150%', borderRadius: 50 }}>{PriceRatio(event.price_normal, event.price_sale)}</p>
									</div>
									<div className="ml-4 mt-0">
										<del className="font-size-60-percent" style={{ color: 'grey' }}>Rp. {CurrencyFormat(event.price_normal)}</del>
									</div>
									<div className="ml-2 mt-1">
										<p className='font-weight-bold' style={{ width: 'auto' }}>Rp. {CurrencyFormat(event.price_sale)}</p>
									</div>
								</> :
								<>
									<div className="mt-1">
										<p className='font-weight-bold' style={{ width: 'auto' }}>Rp. {CurrencyFormat(event.price_normal)}</p>
									</div>
								</>
						}
						
					</div>
					<div className="ml-1 mt-2 row">
						<div className="m-0">
							{!event.speakers ?
								<div>Speaker not Available</div>
								:
								<CustomImage
									folder={PublicStorageFolderPath.cms}
									filename={event.speakers[0]?.speaker.image} //sementara pakai yg pertama
									style={{ width: 45, height: 45, borderRadius: 50 }}
									className="object-fit-cover"
								/>
							}
						</div>
						<div className="ml-1 mt-1">
							<p className='font-weight-bold' style={{ textAlign: 'center', width: 'auto', marginTop: '10%', fontSize: '80%' }}>{event.speakers[0].speaker.name}</p>
						</div>
					</div>
					<TextTruncate lineClamp={3}>
						<TinyMcePreview className="body color-black mt-2 ml-1 text-truncate-container" style={{ color: 'grey', fontSize: '90%' }}>
							{event?.description}
						</TinyMcePreview>
					</TextTruncate>
					

					<Link to={GeneralRoutePath.WEBINAR_DETAIL_EVENT.replace(':id', event.id)}>
						<p className='ml-1 mt-0' style={{ color: '#F8931D', fontSize: '90%' }}>{t('webinar.view_more')}</p>
					</Link>
				</div>
			</Link>
		</div>
	)
}

export default EventCard