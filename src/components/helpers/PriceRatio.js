const PriceRatio=(normal_price, price)=>{
    let result = ""

    try{
        let discount_ratio = Math.floor((parseInt(normal_price) - parseInt(price)) / parseInt(normal_price) * 100)

        result += discount_ratio + "%"
    } catch(err){
        console.log(err)
    }
     
    return result
}

export default PriceRatio