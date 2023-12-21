import { useContext, useEffect } from "react"
import MyContext from "./MyContext"

const MetaTrigger = ({ pageTitle, pageDesc }) => {
    let context = useContext(MyContext)

    useEffect(() => {
        context.changeMetaTitleAndDesc(pageTitle, pageDesc)
    }, [pageTitle, pageDesc])

    return null
}

export default MetaTrigger