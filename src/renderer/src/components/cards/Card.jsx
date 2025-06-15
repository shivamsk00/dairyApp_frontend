import React from 'react'
import "./card.css"
import { FaDatabase, FaRupeeSign, FaUser } from 'react-icons/fa'
import { FaMoneyBillTrendUp } from 'react-icons/fa6'
const Card = ({ width, height, background, data }) => {
    return (
        <div className='customCard' style={{
            backgroundColor: background || '#F3F4EF',
            height: height || 'auto',
            width: width || 250
        }}>
            <div className="cardLeft">
                <h3>{data.title}</h3>
              
                <h1>
                    {
                        data.title == "Customer" ? <FaUser /> : data.title == "Milk Purchase" ?
                             <FaMoneyBillTrendUp /> : data.title =="Inventory" ?   <FaDatabase />:data.title == "Milk Sale" ?<FaMoneyBillTrendUp />:
                            null
                    }


                    {data.total}</h1>
            </div>
            <div className="cardRight">

            </div>

        </div>
    )
}

export default Card