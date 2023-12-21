const GosendStatus = (key) => {
    let status = ""
    if(key === "confirmed") status = "Finding Driver"
    else if(key === "allocated") status = "Driver Allocated" 
    else if(key === "out_for_pickup") status = "Enroute Pickup" 
    else if(key === "picked") status = "Item Picked" 
    else if(key === "out_for_delivery") status = "Enroute Drop" 
    else if(key === "delivered") status = "Completed"  
    else if(key === "cancelled") status = "Cancelled"  
    else if(key === "no_driver") status = "Driver Not Found" 
    else if(key === "on_hold") status = "On Hold" 
    else if(key === "rejected") status = "Rejected" 
    else status = key
    return status
}

export default GosendStatus