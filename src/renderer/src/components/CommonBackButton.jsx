import React from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const CommonBackButton = ({ heading }) => {
    const nav = useNavigate()
    return (
        <button className='commonBackButton' onClick={()=> nav(-1)} >
            <FaArrowLeft />
            {heading && <h2>{heading}</h2>}
        </button>
    )
}

export default CommonBackButton
