import { useState } from "react";
import { useTranslation } from "react-i18next";
import ManualSwitchLanguage from "../../../../components/helpers/ManualSwitchLanguage";
import ProductDiscussion from "../ProductDiscussion";
import ProductInformation from "../ProductInformation";
import ProductReview from "../ProductReview";

/**
 * 
 * @param {string} type config type 
 * @param {object} bundlings bundlings object
 * @param {object} productDetail product detail
 */
const InformationTabs =(props)=>{
    const [currentTab, setCurrentTab] = useState('information')
    const [t] = useTranslation()

    const tab = {
        first: 'information',
        second: 'discussion',
        third: 'reviews',
    };

    const getClassName=(value)=>{
        if(props.type === "type_1"){
            return `${currentTab === value ? 'accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} pointer px-2 px-sm-2 px-md-4 px-lg-4 px-xl-4 py-3`
        }
        else if(props.type === "type_2"){
            return `${currentTab === value ? 'accent-color border-bottom-accent-color bgc-FAFAFB font-weight-bold' : 'color-262626'} pointer px-2 px-sm-2 px-md-4 px-lg-4 px-xl-4 py-2`
        }
    }

    const getBundlingKey=(id)=>{
        return `bundling-${id}`
    }

    const bundlingTabs=()=>{
        let alreadyExist = new Set();
        return(<>
            {props.bundlings.map((item)=>{
                if(alreadyExist.has(item.mp_product_sku.mp_product_id)) {
                    return null
                }
                else {
                    alreadyExist.add(item.mp_product_sku.mp_product_id)
                    let key = getBundlingKey(item.id)
                    return <span key={key} onClick={()=>setCurrentTab(key)} className={getClassName(key)}>
                        <ManualSwitchLanguage data={item.mp_product_sku.mp_product.mp_product_informations} langAttr={"language_code"} valueAttr={"name"} />
                    </span>
                }
            })}
        </>)
    }

    const showCurrentTab=()=>{
        if(currentTab === tab.first) return(
            <ProductInformation 
                type={props.type}
                data={props.productDetail.mp_product_informations}
            />
        )
        else if(currentTab === tab.second) return(
            <ProductDiscussion 
                productDetail={props.productDetail}
            />
        )
        else if(currentTab === tab.third) return(
            <ProductReview 
                type={props.type}
                productDetail={props.productDetail}
            />
        )
        else{
            for(const bundling of props.bundlings){
                let key = getBundlingKey(bundling.id)
                if(currentTab === key) return(
                    <ProductInformation 
                        type={props.type}
                        data={bundling.mp_product_sku.mp_product.mp_product_informations}
                    />
                )
            }
        }
    }
    
    if(props.type === "type_1") return(
        <div className="information mt-4">
            <div className="">
                <span onClick={()=>setCurrentTab(tab.first)} className={getClassName(tab.first)}>{t("product_detail.product_information")}</span>
                {bundlingTabs()}
                <span onClick={()=>setCurrentTab(tab.second)} className={getClassName(tab.second)}>{t("product_detail.discussion")}</span>
                <span onClick={()=>setCurrentTab(tab.third)} className={getClassName(tab.third)}>{t("product_detail.reviews")}</span>
            </div>
            <div className="py-3 bgc-FAFAFB">
                {showCurrentTab()}
            </div>
        </div>
    )
    else if(props.type === "type_2") return(
        <div className="information mt-4">
            <div className="d-flex border-bottom">
                <div onClick={()=>setCurrentTab(tab.first)} className={getClassName(tab.first)}>{t("product_detail.product_information")}</div>
                {bundlingTabs()}
                <div onClick={()=>setCurrentTab(tab.third)} className={getClassName(tab.third)}>{t("product_detail.reviews")}</div>
                <div onClick={()=>setCurrentTab(tab.second)} className={getClassName(tab.second)}>{t("product_detail.discussion")}</div>
            </div>
            <div className="py-3 bgc-FAFAFB">
                {showCurrentTab()}
            </div>
        </div>
    )
    else return null
}

export default InformationTabs;