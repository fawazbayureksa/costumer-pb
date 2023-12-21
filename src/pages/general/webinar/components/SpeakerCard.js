import React, { createRef, useState, useEffect, useRef } from "react";
import GeneralRoutePath from "../../GeneralRoutePath";
import CustomImage, { PublicStorageFolderPath } from "../../../../components/helpers/CustomImage";
import { Link } from "react-router-dom";
import TextTruncate from "../../../../components/helpers/TextTruncate";
import { optionExpertiseLevel } from "./WebinarOptions";
import { useTranslation } from 'react-i18next';

const SpeakerCard = ({ speaker }) => {

	const setExpLabel = (level) => {
		let result = optionExpertiseLevel.find(x=>x.value === level)
		if (result) {
			return result.label
		} else {
			return level
		}
    }

	const { t } = useTranslation()

	return (
		<div className="bg-white p-3 mb-3 col-xl-3 position-relative">
			<Link to={GeneralRoutePath.WEBINAR_DETAIL_SPEAKER.replace(':id', speaker?.id)} className='text-decoration-none'>
				<CustomImage
					folder={PublicStorageFolderPath.cms}
					filename={speaker?.image}
					style={{ width: '100%', height: 200 }}
					className="object-fit-cover"
				/>
				<div className="bg-white position-relative shadow-graph rounded p-2" style={{height: '45%'}}>
					<div className="ml-1 row" style={{ marginBottom: 0 }}>
						<div className='d-flex' style={{ backgroundColor: '#F8931D', textAlign: 'center', borderRadius: 50 }}>
							<i className="fas fa-crown ml-2 mr-1" style={{ color: 'white' }}></i>
							<p className='small mr-3' style={{ color: 'white' }}>{setExpLabel(speaker?.expertise_level)}</p>
						</div>
					</div>
					<TextTruncate lineClamp={2}>
						<p className='font-weight-bold ml-2 mt-1' style={{ fontSize: '110%', marginBottom: 0 }}>{speaker?.name}</p>
					</TextTruncate>
					<div className="ml-2 mt-1 mr-2 row">
						<TextTruncate lineClamp={1}>
							<p className="font-size-80-percent" style={{ width: 'auto' }}>{t('webinar.specialityIn')} {speaker?.expertise}</p>
						</TextTruncate>
					</div>
					<div className="ml-1 mt-2 row">
						<i className="fas fa-star" style={{color: '#F8931D'}} />
						<p className="font-size-80-percent ml-1" style={{ width: 'auto' }}>{speaker?.rating}</p>
					</div>
				</div>
			</Link>
		</div>
	)
}

export default SpeakerCard