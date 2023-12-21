import axios from 'axios'
import Cookies from 'js-cookie'
import React, { useState, useEffect } from 'react'
import Carousel from 'react-multi-carousel'
import Config from '../../../../components/axios/Config'
import SwalToast from '../../../../components/helpers/SwalToast'

export default function SelectCategory({ listCategories, handleCategory, idCategory }) {

    return (
        <>
            <style>{`
            .tab-category-mobile {
                display: none;
            }
                    @media (max-width: 767.98px) {
                        .tab-category-mobile {
                            display: flex;
                        }
                    }
                `}
            </style>
            <div className='tab-category-mobile'
                style={{
                    overflowX: "auto",
                }}>
                <div
                    onClick={() => handleCategory(null)}
                    className={` ${idCategory === null ? 'bgc-accent-color' : ''} mx-2 cursor-pointer`}
                    style={{
                        minWidth: 100,
                        borderRadius: 50,
                        display: "flex",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "#FFF",
                        alignItems: "center",
                        backgroundColor: "#F5F5F5",
                        height: 40,
                    }}
                >
                    <p>Semua</p>
                </div>

                {/* <Carousel
                responsive={responsive}
                autoPlay={false}
                centerMode={true}

            > */}
                {
                    listCategories && listCategories.map((i, index) => (
                        <div
                            key={i.id}
                            onClick={() => handleCategory(i.id)}
                            className={`mx-2 button-nowrap cursor-pointer ${idCategory === i.id ? 'bgc-accent-color' : ''}`}
                            style={{
                                padding: 10,
                                width: "auto",
                                display: "flex",
                                justifyContent: "center",
                                borderWidth: 1,
                                borderColor: "#FFF",
                                borderRadius: 50,
                                alignItems: "center",
                                backgroundColor: "#F5F5F5",
                                height: 40
                            }}
                        >
                            <p>{i.name}</p>
                        </div>
                    ))
                }
                {/* </Carousel> */}
            </div >
        </>
    )
}
