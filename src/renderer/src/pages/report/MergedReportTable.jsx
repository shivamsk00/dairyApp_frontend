import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
};

const mergeReportByDate = (milk, products, payments) => {
  const map = new Map();

  milk.forEach((entry) => {
    const key = entry.date;
    if (!map.has(key)) map.set(key, { date: key, milk: [], products: [], given: [], received: [], lastNote: '' });
    map.get(key).milk.push(entry);
  });

  products.forEach((entry) => {
    const key = entry.date;
    if (!map.has(key)) map.set(key, { date: key, milk: [], products: [], given: [], received: [], lastNote: '' });
    map.get(key).products.push(entry);
  });

  payments.forEach((entry, i, arr) => {
    const key = entry.date?.split('-').reverse().join('-'); // convert dd-mm-yyyy to yyyy-mm-dd
    if (!map.has(key)) map.set(key, { date: key, milk: [], products: [], given: [], received: [], lastNote: '' });

    const isLast = i === arr.length - 1;
    if (entry.credit_debit_mode === 'given') {
      map.get(key).given.push(entry);
    } else {
      map.get(key).received.push(entry);
    }

    if (isLast) {
      map.get(key).lastNote = entry.note || '';
    }
  });

  return [...map.values()].sort((a, b) => new Date(a.date) - new Date(b.date));
};

const MergedReportTable = ({ summaryData }) => {
  if (!summaryData) return null;

  const merged = mergeReportByDate(
    summaryData.milk_collections || [],
    summaryData.product_sales || [],
    summaryData.payments || []
  );

  return (
    <div className="mt-12 p-6">
      <h3 className="text-xl font-semibold mb-4">Merged Daily Report</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="border px-2 py-2">Date</th>
              <th className="border px-2 py-2">Milk</th>
              <th className="border px-2 py-2">Products</th>
              <th className="border px-2 py-2">Given</th>
              <th className="border px-2 py-2">Received</th>
              <th className="border px-2 py-2">Last Message</th>
            </tr>
          </thead>
          <tbody>
            {merged.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}>
                <td className="border px-2 py-2 text-center font-semibold">
                  {formatDate(entry.date)}
                </td>

                {/* Milk */}
                <td className="border px-2 py-2">
                  {entry.milk.length ? (
                    <ul className="list-disc pl-4">
                      {entry.milk.map((m, i) => (
                        <li key={i}>{m.shift} - {m.quantity}L (₹{m.total_amount})</li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Products */}
                <td className="border px-2 py-2">
                  {entry.products.length ? (
                    <ul className="list-disc pl-4">
                      {entry.products.map((p, i) => (
                        <li key={i}>
                          {p.product_name} × {p.quantity} (₹{p.total_amount})
                        </li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Given Payments */}
                <td className="border px-2 py-2 text-red-700">
                  {entry.given.length ? (
                    <ul className="list-disc pl-4">
                      {entry.given.map((p, i) => (
                        <li key={i}>-₹{p.amount} ({p.note})</li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Received Payments */}
                <td className="border px-2 py-2 text-green-700">
                  {entry.received.length ? (
                    <ul className="list-disc pl-4">
                      {entry.received.map((p, i) => (
                        <li key={i}>+₹{p.amount} ({p.note})</li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Last Note */}
                <td className="border px-2 py-2 italic text-sm text-blue-600">
                  {entry.lastNote || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MergedReportTable;
