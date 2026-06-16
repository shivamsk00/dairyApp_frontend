import React from 'react'
import { BsFillPrinterFill } from 'react-icons/bs';
import { FaEye, FaPen } from 'react-icons/fa';
import { FaTrashCan } from 'react-icons/fa6';

const MilkCollectionTable = (
    {
        morningCollection,
        eveningCollection,
        isShift,
        handlePrint,
        setSelectedCustomer,
        setIsModalOpen,
        setIsEditeModal,
        setDeleteId,
        setShowConfirmModal
    }
) => {

    console.log("TABLE RENDERED");
    return (
        <>
            {/* Table */}
            <div className="flex flex-col flex-1 relative overflow-hidden  mt-1">
                {/* Fixed Header */}
                <div className="bg-black border-b w-full min-w-[1000px] sticky top-0 z-10">
                    <table className="w-full text-xl table-fixed">
                        <colgroup>
                            <col style={{ width: '40px' }} />     {/* SR */}
                            <col style={{ width: '80px' }} />     {/* AC No */}
                            <col style={{ width: '120px' }} />    {/* Name */}
                            <col style={{ width: '80px' }} />     {/* Date */}
                            <col style={{ width: '60px' }} />     {/* Shift */}
                            <col style={{ width: '60px' }} />     {/* Qty */}
                            <col style={{ width: '50px' }} />     {/* FAT */}
                            <col style={{ width: '50px' }} />     {/* SNF */}
                            <col style={{ width: '70px' }} />     {/* Rate */}
                            <col style={{ width: '60px' }} />     {/* Other */}
                            <col style={{ width: '70px' }} />     {/* Total */}
                            <col style={{ width: '70px' }} />     {/* Balance */}
                            <col style={{ width: '130px' }} />    {/* Actions */}
                        </colgroup>
                        <thead>
                            <tr>
                                {['SR', 'AC No', 'Name', 'Date', 'Shift', 'Qty', 'FAT', 'SNF', 'Rate', 'Other', 'Total', 'Balance', 'Actions'].map(header => (
                                    <th key={header} className="px-1 py-1 text-center text-[12px] font-bold text-white truncate">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                    </table>
                </div>

                {/* Scrollable Body with bottom padding for footer space */}
                <div className="flex-1 overflow-auto scrollable-table pb-28">
                    <div className="min-w-[1000px]">
                        <table className="w-full text-xl table-fixed">
                            <colgroup>
                                <col style={{ width: '40px' }} />     {/* SR */}
                                <col style={{ width: '80px' }} />     {/* AC No */}
                                <col style={{ width: '120px' }} />    {/* Name */}
                                <col style={{ width: '80px' }} />     {/* Date */}
                                <col style={{ width: '60px' }} />     {/* Shift */}
                                <col style={{ width: '60px' }} />     {/* Qty */}
                                <col style={{ width: '50px' }} />     {/* FAT */}
                                <col style={{ width: '50px' }} />     {/* SNF */}
                                <col style={{ width: '70px' }} />     {/* Rate */}
                                <col style={{ width: '60px' }} />     {/* Other */}
                                <col style={{ width: '70px' }} />     {/* Total */}
                                <col style={{ width: '70px' }} />     {/* Balance */}
                                <col style={{ width: '130px' }} />    {/* Actions */}
                            </colgroup>
                            <tbody>
                                {morningCollection.length === 0 && eveningCollection.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="text-center text-gray-500 text-[12px] py-8">
                                            No data available
                                        </td>
                                    </tr>
                                ) : (
                                    <>
                                        {isShift === 'morning' && morningCollection.length > 0 && (
                                            <>
                                                <tr className="bg-orange-100">
                                                    <td colSpan="13" className="px-2 py-2 text-center font-semibold text-blue-800 text-xs">
                                                        Morning Collection ({morningCollection.length})
                                                    </td>
                                                </tr>
                                                {morningCollection.map((item, i) => (
                                                    <tr key={`morning-${i}`} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate">{i + 1}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  text-blue-600 truncate">{item.customer_account_number}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate" title={item.name}>{item.name}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate">{item.date}</td>
                                                        <td className="px-2 py-1 truncate">
                                                            <span className="px-1 py-0.5 text-[14px] font-bold bg-orange-100 text-orange-800 rounded block text-center">
                                                                {item.shift === 'morning' ? 'Morning' : item.shift}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.quantity}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate">{item.fat}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate">{item.snf}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold text-green-600 truncate">₹{item.base_rate}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate">₹{item.other_price}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  text-green-700 truncate">₹{item.total_amount}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold text-blue-600 truncate">₹{item?.customer?.wallet || 0}</td>
                                                        <td className="px-2 py-1">
                                                            <div className="flex gap-0.5 justify-center">
                                                                <button
                                                                    className="p-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200 transition-colors"
                                                                    onClick={() => handlePrint(item)}
                                                                    title="Print"
                                                                >
                                                                    <BsFillPrinterFill size={16} />
                                                                </button>
                                                                <button
                                                                    className="p-1 bg-green-100 text-green-600 rounded text-xs hover:bg-green-200 transition-colors"
                                                                    onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
                                                                    title="View"
                                                                >
                                                                    <FaEye size={16} />
                                                                </button>
                                                                <button
                                                                    className="p-1 bg-yellow-100 text-yellow-600 rounded text-xs hover:bg-yellow-200 transition-colors"
                                                                    onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
                                                                    title="Edit"
                                                                >
                                                                    <FaPen size={16} />
                                                                </button>
                                                                <button
                                                                    className="p-1 bg-red-100 text-red-600 rounded text-xs hover:bg-red-200 transition-colors"
                                                                    onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
                                                                    title="Delete"
                                                                >
                                                                    <FaTrashCan size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}

                                        {isShift === 'evening' && eveningCollection.length > 0 && (
                                            <>
                                                <tr className="bg-purple-100">
                                                    <td colSpan="13" className="px-2 py-2 text-center font-semibold text-purple-800 text-xs">
                                                        Evening Collection ({eveningCollection.length})
                                                    </td>
                                                </tr>
                                                {eveningCollection.map((item, i) => (
                                                    <tr key={`evening-${i}`} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                                                        <td className="px-2 py-1 text-[14px] font-bold  truncate">{i + 1}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold   text-blue-600 truncate">{item.customer_account_number}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold truncate" title={item.name}>{item.name}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.date}</td>
                                                        <td className="px-2 py-1 truncate">
                                                            <span className="px-1 py-0.5 text-[14px] font-bold  bg-purple-100 text-purple-800 rounded block text-center">
                                                                {item.shift === 'evening' ? 'Evening' : item.shift}
                                                            </span>
                                                        </td>
                                                        <td className="px-2 py-1 text-[14px] font-bold   truncate">{item.quantity}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.fat}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  truncate">{item.snf}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  text-green-600 truncate">₹{item.base_rate}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  truncate">₹{item.other_price}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold   text-green-700 truncate">₹{item.total_amount}</td>
                                                        <td className="px-2 py-1 text-[14px] font-bold  text-blue-600 truncate">₹{item?.customer?.wallet || 0}</td>
                                                        <td className="px-2 py-1">
                                                            <div className="flex gap-0.5 justify-center">
                                                                <button
                                                                    className="p-1 bg-blue-100 text-blue-600 rounded text-[14px] font-bold  hover:bg-blue-200 transition-colors"
                                                                    onClick={() => handlePrint(item)}
                                                                    title="Print"
                                                                >
                                                                    <BsFillPrinterFill size={16} />
                                                                </button>
                                                                <button
                                                                    className="p-1 bg-green-100 text-green-600 rounded text-[14px] font-bold  hover:bg-green-200 transition-colors"
                                                                    onClick={() => { setSelectedCustomer(item); setIsModalOpen(true); }}
                                                                    title="View"
                                                                >
                                                                    <FaEye size={16} />
                                                                </button>
                                                                <button
                                                                    className="p-1 bg-yellow-100 text-yellow-600 rounded text-[14px] font-bold  hover:bg-yellow-200 transition-colors"
                                                                    onClick={() => { setSelectedCustomer(item); setIsEditeModal(true); }}
                                                                    title="Edit"
                                                                >
                                                                    <FaPen size={16} />
                                                                </button>
                                                                <button
                                                                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                                                                    onClick={() => { setDeleteId(item.id); setShowConfirmModal(true); }}
                                                                    title="Delete"
                                                                >
                                                                    <FaTrashCan size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Completely Fixed Footer at Bottom - Will NOT scroll */}
                <div className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t z-10">
                    <div className="p-3">
                    </div>
                </div>
            </div>
        </>
    )
}

export default React.memo(MilkCollectionTable)