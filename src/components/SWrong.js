import React from 'react'
import './SWrong.css'
import { FaPager } from "@react-icons/all-files/fa/FaPager";


function SWrong() {
    return (
        <div className='swrong'>
            <FaPager size={300} color="grey"/>
            <h1 className='swrong-title'>Oops! Something went wrong</h1>
            <p className='swrong-description'>The current page failed to display. Please try refreshing browser window.</p>
        </div>
    )
}

export default SWrong