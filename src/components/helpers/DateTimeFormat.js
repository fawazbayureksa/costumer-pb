import "react-datepicker/dist/react-datepicker.css";

/**
 * 
 * @param {datetime} datetime datetime to format
 * @param {int} type -1:{time}, 0:{dd MMMM yyyy}, 1:{dd MMM yyyy, time}, 2:{dd MMM yyyy time}, 3:{yyyy/MM/dd at time}, 4:{time dd/MM/yyyy} 5:{yyyy-MM-dd time}
 * @returns 
 */
export const DateTimeFormat = (datetime, type) => {
    try {
        if (!datetime) return datetime;
        datetime = new Date(datetime);

        if (type === -1) {
            let time = datetime.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

            return `${time}`;

        } else if (type === 0) {
            let MM = datetime.toLocaleString('default', { month: 'long' }); // long, short  
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();

            return `${dd} ${MM} ${yyyy}`;

        } else if (type === 1) {
            let MM = datetime.toLocaleString('default', { month: 'short' }); // long, short
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();
            let time = datetime.toLocaleString('default', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', });

            return `${dd} ${MM} ${yyyy}, ${time}`;

        } else if (type === 2) {
            let MM = datetime.toLocaleString('default', { month: 'short' }); // long, short
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();
            let time = datetime.toLocaleString('default', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

            return `${dd} ${MM} ${yyyy} ${time}`;

        } else if (type === 3) {
            let MM = datetime.toLocaleString('default', { month: '2-digit' }); // long, short
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();
            let time = datetime.toLocaleString('default', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', });

            return `${yyyy}/${MM}/${dd} at ${time}`;
        } else if (type === 4) {
            let MM = datetime.toLocaleString('default', { month: '2-digit' }); // long, short
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();
            let time = datetime.toLocaleString('default', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

            return `${time} ${dd}/${MM}/${yyyy}`;
        } else if (type === 5) {
            let MM = datetime.toLocaleString('default', { month: '2-digit' }); // long, short
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();
            let time = datetime.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });

            return `${yyyy}-${MM}-${dd} ${time}`;

        } else {
            let MM = datetime.toLocaleString('default', { month: 'short' }); // long, short
            let dd = datetime.toLocaleString('default', { day: '2-digit' });
            let yyyy = datetime.getFullYear();
            let time = datetime.toLocaleString('default', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

            return `${dd} ${MM} ${yyyy} ${time}`;
        }
    } catch (err) {
        return datetime;
    }
}