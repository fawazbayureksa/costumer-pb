import React from 'react';
import { useMediaQuery } from 'react-responsive'

const Responsive = ({ desktop, mobile }) => {

    const isDesktop = useMediaQuery({ minWidth: 768 })
    const isMobile = useMediaQuery({ maxWidth: 767 })

    if (isDesktop) return desktop
    else if (isMobile) return mobile
    else return null
}

export default Responsive;

