const CurrencyFormat = (nominal) => {
    let nominalInt = parseInt(nominal);
    if (isNaN(nominalInt) || nominalInt === 0) {
        return '0';
    } else {
        let number_string = nominal.toString().replace(/[^,\d]/g, '').toString(),
            split = number_string.split(','),
            left_over = split[0].length % 3,
            res = split[0].substr(0, left_over),
            thousands = split[0].substr(left_over).match(/\d{3}/gi);

        if(thousands){
            let separator = left_over ? '.' : '';
            res += separator + thousands.join('.');
        }

        res = split[1] !== undefined ? res + ',' + split[1] : res;
        return res;
    }
};


export const CurrencyFormat2 = (price)=>{
    try{
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    } catch(Exception){
        return price
    }
}

export default CurrencyFormat;