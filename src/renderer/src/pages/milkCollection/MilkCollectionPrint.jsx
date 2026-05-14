import React, { useEffect } from 'react'

const MilkCollectionPrint = () => {
    const [data, setData] = useState(null)

    useEffect(() => {
        // Get data from additionalArguments
        const args = window.process.argv.find(arg => {
            try {
                const parsed = JSON.parse(arg)
                return parsed?.customerName
            } catch {
                return false
            }
        })

        if (args) {
            setData(JSON.parse(args))
        }

        setTimeout(() => {
            window.print()
        }, 500)
    }, [])

    if (!data) return <div>Loading...</div>
    return (
        <div style={{ padding: '1rem', fontSize: '14px' }}>
            <h2>Milk Collection Slip</h2>
            <p><strong>Customer:</strong> {data.customerName}</p>
            <p><strong>FAT:</strong> {data.fat}</p>
            <p><strong>SNF:</strong> {data.snf}</p>
            <p><strong>CLR:</strong> {data.clr}</p>
            <p><strong>Total:</strong> ₹{data.total}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
        </div>
    )
}

export default MilkCollectionPrint
