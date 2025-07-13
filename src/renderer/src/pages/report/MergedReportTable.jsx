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
    const key = entry.date?.split('-').reverse().join('-'); // Convert to yyyy-mm-dd
    if (!map.has(key)) map.set(key, { date: key, milk: [], products: [], given: [], received: [], lastNote: '' });
    map.get(key).products.push(entry);
  });

  payments.forEach((entry, i, arr) => {
    const key = entry.date?.split('-').reverse().join('-');
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
    <div className="mt-10 px-6">
      <h3 className="text-2xl font-bold mb-6 text-purple-700">📊 Merged Daily Report</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-sm shadow-md rounded-lg overflow-hidden">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="border px-3 py-2 text-left">Date</th>
              <th className="border px-3 py-2 text-left">Milk Collection</th>
              <th className="border px-3 py-2 text-left">Product Sales</th>
              <th className="border px-3 py-2 text-left">Given</th>
              <th className="border px-3 py-2 text-left">Received</th>
              <th className="border px-3 py-2 text-left">Last Message</th>
            </tr>
          </thead>
          <tbody>
            {merged.map((entry, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Date */}
                <td className="border px-3 py-2 font-semibold">{formatDate(entry.date)}</td>

                {/* Milk Collection */}
                <td className="border px-3 py-2">
                  {entry.milk.length ? (
                    <ul className="space-y-1">
                      {entry.milk.map((m, i) => (
                        <li key={i} className="text-gray-700">
                          <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full mr-2">
                            {m.shift}
                          </span>
                          {m.quantity}L × ₹{parseFloat(m.base_rate).toFixed(2)} = ₹{parseFloat(m.total_amount).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Products */}
                <td className="border px-3 py-2">
                  {entry.products.length ? (
                    <ul className="space-y-1">
                      {entry.products.map((p, i) => (
                        <li key={i} className="text-gray-700">
                          {p.product?.name || '—'} × {p.qty} = ₹{p.total}
                        </li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Given Payments */}
                <td className="border px-3 py-2 text-red-700">
                  {entry.given.length ? (
                    <ul className="space-y-1">
                      {entry.given.map((p, i) => (
                        <li key={i}>- ₹{p.amount} <span className="text-gray-500">({p.note})</span></li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Received Payments */}
                <td className="border px-3 py-2 text-green-700">
                  {entry.received.length ? (
                    <ul className="space-y-1">
                      {entry.received.map((p, i) => (
                        <li key={i}>+ ₹{p.amount} <span className="text-gray-500">({p.note})</span></li>
                      ))}
                    </ul>
                  ) : '—'}
                </td>

                {/* Last Note */}
                <td className="border px-3 py-2 italic text-blue-600">
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
