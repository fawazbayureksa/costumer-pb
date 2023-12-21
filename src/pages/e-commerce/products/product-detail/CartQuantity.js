import { useEffect, useState } from "react"

/**
 * 
 * @param {string} type config type 
 * @param {integer} stock current selected variant stock
 * @param {integer} maxOrder current product max order
 * @param {function} onChange callback when cart quantity is changed
 * @returns 
 */
const CartQuantity=(props)=>{

    const [cartPlusDisabled, setCartPlusDisabled] = useState(true)
    const [cartMinusDisabled, setCartMinusDisabled] = useState(true)
    const [cartQty, setCartQty] = useState(1)

    useEffect(()=>{
        props.onChange(cartQty)
        checkCartMinusPlusDisabled()
    }, [cartQty])

    const checkCartMinusPlusDisabled=()=>{
        let min = 1 
        let max = props.stock
        if(props.maxOrder){
            max = Math.min(max, props.maxOrder)
        }

        if(cartQty === min){
            setCartMinusDisabled(true)
        } else{
            setCartMinusDisabled(false)
        }

        if(max !== null && cartQty === max){
            setCartPlusDisabled(true)
        } else{
            setCartPlusDisabled(false)
        }
    }

    const handleCartQty = (isDecrease = false) => {
        // min don't use min_order because will error in case min order is 2 max order is 3
        // if user add to cart twice when qty is 2, 2*2=4 but user want 3 then it won't be possible
        let max = props.stock
        if(props.maxOrder){
            max = Math.min(max, props.maxOrder)
        }
        let quantity = parseInt(cartQty);
        if (isDecrease) {
            if (quantity - 1 >= 1) {
                quantity -= 1;

                setCartQty(quantity)  
            } else {
                console.log('over min');
            }
        } else {
            if (max !== null && quantity + 1 > max) {
                console.log('over max');
            } else {
                quantity += 1;

                setCartQty(quantity)              
            }
        }
    }
    
    const handleQtyFromInput = (event) => {
        let min = 1
        let max = props.stock
        if(props.maxOrder){
            max = Math.min(max, props.maxOrder)
        }
        let quantity = parseInt(event.target.value);
        if (!isNaN(quantity)) {
            if (quantity < min) {
                quantity = min
            } else if(max !== null && quantity > max){
                quantity = max
            }

            setCartQty(quantity)
        } else {
            quantity = min
            
            setCartQty(quantity)
        }
    }

    if(props.type === "type_1") return(
        <div className="d-flex align-items-center bgc-F6F7F8">
            <button className="btn color-0063B0 bgc-F6F7F8" onClick={event => handleCartQty(true)} disabled={cartMinusDisabled}>-</button>
            <label className="m-0">
                <input
                    type="text"
                    className="border-0 bgc-F6F7F8 text-center font-size-70-percent mx-2"
                    style={{width: '2rem'}}
                    value={cartQty}
                    onChange={handleQtyFromInput}
                />
            </label>
            <button className="btn color-0063B0 bgc-F6F7F8" onClick={event => handleCartQty()} disabled={cartPlusDisabled}>+</button>
        </div>
    )
    else if(props.type === "type_2") return(
        <div className="d-flex align-items-center my-2">
            <button className="btn" onClick={event => handleCartQty(true)} disabled={cartMinusDisabled}><i className="fas fa-minus-circle accent-color"/></button>
            <label className="m-0 border-bottom mx-2">
                <input
                    type="text"
                    className="border-0 text-center font-size-70-percent mx-2"
                    style={{ width: '2rem' }}
                    value={cartQty}
                    onChange={handleQtyFromInput}
                />
            </label>
            <button className="btn" onClick={event => handleCartQty()} disabled={cartPlusDisabled}><i className="fas fa-plus-circle accent-color"/></button>
        </div>
    )
    else return null
}

export default CartQuantity
