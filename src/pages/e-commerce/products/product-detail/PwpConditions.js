import { useTranslation } from "react-i18next";
import { CurrencyFormat2 } from "../../../../components/helpers/CurrencyFormat";
import CustomImage from "../../../../components/helpers/CustomImage";
import ManualSwitchLanguage, { ManualSwitchLanguageFn } from "../../../../components/helpers/ManualSwitchLanguage";
import { TinyMceContent } from "../../../../components/helpers/TinyMceEditor";

/**
 * 
 * @param {object} data pwp object 
 * @returns 
 */
const PwpConditions =({data})=>{
    // const [t] = useTranslation()
    
    if(data) return(
        <div>
            <TinyMceContent>                
                {ManualSwitchLanguageFn(data.informations, "language_code", "terms_and_conditions")}
            </TinyMceContent>
        </div>
    )
    else return null
}

export default PwpConditions;