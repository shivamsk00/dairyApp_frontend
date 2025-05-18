import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import useHomeStore from '../../zustand/useHomeStore';

const SnfChartPage = () => {
     const [formValues, setFormValues] = useState({
          A: 4,
          B: 0.2,
          C: 0.66,
     });

     const [saveTrigger, setSaveTrigger] = useState(0);
     const snfFormulaDataFetch = useHomeStore(state => state.snfFormulaDataFetch);
     const getSnfFormulaData = useHomeStore(state => state.getSnfFormulaData);
     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormValues({
               ...formValues,
               [name]: value,
          });
     };

     const handleSave = async (e) => {
          e.preventDefault();

          const formulaData = [
               { A: parseFloat(formValues.A) },
               { B: parseFloat(formValues.B) },
               { C: parseFloat(formValues.C) },
          ];

          try {
               // ✅ 1. Save SNF formula to backend
               await snfFormulaDataFetch(formulaData);

               // ✅ 2. Trigger SNF chart data generation
               setSaveTrigger(prev => prev + 1); // will trigger Chart component to recalculate

               // ✅ 3. Optionally send postMessage or reload iframe if needed
               setTimeout(() => {
                    document.querySelector('iframe')?.contentWindow?.postMessage('triggerFetch', '*');
               }, 0);


          } catch (error) {
               alert('Failed to update SNF formula or chart.');
          }
     };

     const handleReset = () => {
          setFormValues({
               A: 4,
               B: 0.2,
               C: 0.66,
          });
     };
     // Latest values for Snf Formulas
     useEffect(() => {
          const fetchFormula = async () => {
               const data = await getSnfFormulaData();
               if (data) {
                    setFormValues({
                         A: data.A,
                         B: data.B,
                         C: data.C,
                    });
               }
          };

          fetchFormula();
     }, []);

     return (
          <>
               <section className="container mx-auto p-6">
                    <div className="flex justify-center items-center mb-8">
                         <form
                              onSubmit={handleSave}
                              className="w-full max-w-md p-6 border rounded-lg shadow-md bg-gray-50"
                         >
                              <h2 className="text-xl font-semibold text-center mb-6">SNF Formula</h2>
                              <p className="text-center text-sm mb-6">(CLR / A) + (B * FAT) + C</p>

                              <label className="block text-sm font-medium mb-2">A:</label>
                              <input
                                   type="number"
                                   name="A"
                                   value={formValues.A}
                                   onChange={handleChange}
                                   step="any"
                                   className="w-full p-3 mb-4 border rounded-lg text-sm"
                              />

                              <label className="block text-sm font-medium mb-2">B:</label>
                              <input
                                   type="number"
                                   name="B"
                                   value={formValues.B}
                                   onChange={handleChange}
                                   step="any"
                                   className="w-full p-3 mb-4 border rounded-lg text-sm"
                              />

                              <label className="block text-sm font-medium mb-2">C:</label>
                              <input
                                   type="number"
                                   name="C"
                                   value={formValues.C}
                                   onChange={handleChange}
                                   step="any"
                                   className="w-full p-3 mb-6 border rounded-lg text-sm"
                              />

                              <div className="flex justify-between items-center">
                                   <button
                                        type="submit"
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                                   >
                                        Save
                                   </button>
                                   <button
                                        type="button"
                                        onClick={handleReset}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                   >
                                        Reset
                                   </button>
                              </div>
                         </form>
                    </div>

                    <Chart formValues={formValues} trigger={saveTrigger} />
               </section>
          </>
     );
};

export default SnfChartPage;
