import { CurrencyFormat2 } from '../helpers/CurrencyFormat';
import { Accordion, Modal } from 'react-bootstrap';
import { ManualSwitchLanguageFn } from '../helpers/ManualSwitchLanguage';
import { TinyMceContent } from '../helpers/TinyMceEditor';
import { useTranslation } from 'react-i18next';
import CustomImage, { PublicStorageFolderPath } from '../helpers/CustomImage';
import { useState } from 'react';
import { DateTimeFormat } from '../helpers/DateTimeFormat';


export const VoucherRowSelected = ({ item }) => {

    const [t] = useTranslation()

    const getDiscountText = () => {
        if (item.voucher.discount_type === "fixed") return `Rp${CurrencyFormat2(item.voucher.discount)}`
        else if (item.voucher.discount_type === "percentage") return `${item.voucher.discount}%`

        return ''
    }

    const getDiscountForText = () => {
        if (item.voucher.discount_for === "product") return t('voucher.product')
        else if (item.voucher.discount_for === "shipping") return t('voucher.shipping')

        return ''
    }

    return (<>
        <div key={item.id} className={`mb-3 border p-2`} style={{ borderRadius: 10 }}>
            <CustomImage folder={PublicStorageFolderPath.voucher} filename={item.voucher.image} alt={item.voucher.image} style={{ maxWidth: '100%' }} />
            <div className="" style={{ display: 'grid', gridTemplateColumns: '5fr', gap: 10 }}>
                <div className="overflow-hidden">
                    <div>{t('voucher.you_get_discount', {
                        discount: getDiscountText(),
                        discount_for: getDiscountForText()
                    })}</div>
                </div>
            </div>
        </div>
    </>)
}

const VoucherRow = ({ item, onSelect, selected, disabled, page }) => {
    const [show_detail, set_show_detail] = useState(false)

    const [t] = useTranslation()

    const getMinPurchase = () => {
        if (!item.voucher.conditions) return null
        let min_purchase = item.voucher.conditions.find(x => x.type === "min_purchase" && x.purchase_trigger === false)
        if (min_purchase) return min_purchase.value

        return 0
    }

    const onSelectLocal = () => {
        if (onSelect) onSelect(item.id)
    }

    const toggleAccordion = (e) => {
        e.stopPropagation()
    }

    const showDetail = () => {
        set_show_detail(true)
    }

    const closeDetail = () => {
        set_show_detail(false)
    }

    return (<>
        <div key={item.id} className={`mb-3 d-flex ${selected || page === `my-vouchers` ? "border-accent-color" : "border"} ${disabled ? "disabled" : ""} p-2`} style={{ borderRadius: 10 }} onClick={onSelectLocal}>
            <div className="col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 d-flex align-items-center">
                <CustomImage folder={PublicStorageFolderPath.voucher} filename={item.voucher.image} alt={item.voucher.image} style={{ maxWidth: '100%' }} />
            </div>
            <div className="col-8 col-sm-8 col-md-8 col-lg-8 col-xl-8">
                <div className="d-flex justify-content-between">
                    <div className="overflow-hidden">
                        <div className="font-weight-bold">{item.voucher.name}</div>
                        <div>{item.voucher.code}</div>
                        <div>{t('voucher.min_purchase')} Rp{CurrencyFormat2(getMinPurchase())}</div>
                        <div>
                            {item.active_end_date && <span className="mr-1">
                                {t('voucher.until')} {DateTimeFormat(item.active_end_date, 2)}
                            </span>}
                        </div>

                        {page === `my-vouchers` ?
                            <div onClick={showDetail} className="link accent-color">{t('voucher.detail')}</div> :
                            <Accordion defaultActiveKey="0">
                                <Accordion.Toggle className="link accent-color" as="div" onClick={toggleAccordion} eventKey={item.id}>{t('voucher.detail')}</Accordion.Toggle>
                                <Accordion.Collapse eventKey={item.id}>
                                    <TinyMceContent>
                                        {ManualSwitchLanguageFn(item.voucher.informations, "language_code", "terms_and_conditions")}
                                    </TinyMceContent>
                                </Accordion.Collapse>
                            </Accordion>}
                    </div>
                    {onSelect && <div className="align-self-center mr-3">
                        <div hidden={!selected}>
                            <i className="fas fa-check accent-color fa-lg" />
                        </div>
                        <div hidden={selected}>
                            <i className="fas fa-plus accent-color fa-lg" />
                        </div>
                    </div>}
                </div>
            </div>

        </div>

        <Modal centered show={show_detail} onHide={closeDetail}>
            <Modal.Body>
                <TinyMceContent>
                    {ManualSwitchLanguageFn(item.voucher.informations, "language_code", "terms_and_conditions")}
                </TinyMceContent>
            </Modal.Body>
        </Modal>
    </>)
}

export default VoucherRow
