import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import useHomeStore from '../../zustand/useHomeStore';
import CustomToast from '../../helper/costomeToast';

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
               const res = await snfFormulaDataFetch(formulaData);
               console.log("response update snf chart", res.data);
               if (res.status_code == 200) {
                    CustomToast.success(res.message);
               } else {
                    CustomToast.error(res.message);
               }

               setSaveTrigger(prev => prev + 1);
          } catch (error) {
               CustomToast.error(error);
          }
     };

     const handleReset = () => {
          setFormValues({
               A: 4,
               B: 0.2,
               C: 0.66,
          });
     };

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
          <section className="h-screen bg-gradient-to-br  text-white p-6 overflow-auto">
             
                    <div className="flex justify-center items-center mb-10">
                         <form
                              onSubmit={handleSave}
                              className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-8"
                         >
                              <h2 className="text-2xl font-bold text-center mb-4 text-teal-400">SNF Formula Settings</h2>
                              <p className="text-center text-sm mb-8 text-gray-300">(CLR / A) + (B × FAT) + C</p>

                              {/* Field A */}
                              <div className="mb-6">
                                   <label className="block text-sm mb-2 text-gray-200">Value for A:</label>
                                   <input
                                        type="number"
                                        name="A"
                                        value={formValues.A}
                                        onChange={handleChange}
                                        step="any"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                   />
                              </div>

                              {/* Field B */}
                              <div className="mb-6">
                                   <label className="block text-sm mb-2 text-gray-200">Value for B:</label>
                                   <input
                                        type="number"
                                        name="B"
                                        value={formValues.B}
                                        onChange={handleChange}
                                        step="any"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                   />
                              </div>

                              {/* Field C */}
                              <div className="mb-6">
                                   <label className="block text-sm mb-2 text-gray-200">Value for C:</label>
                                   <input
                                        type="number"
                                        name="C"
                                        value={formValues.C}
                                        onChange={handleChange}
                                        step="any"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                                   />
                              </div>

                              <div className="flex justify-between items-center mt-6">
                                   <button
                                        type="submit"
                                        className="w-full mr-2 bg-teal-600 hover:bg-teal-700 transition text-white font-semibold py-2 rounded-lg"
                                   >
                                        Save
                                   </button>
                                   <button
                                        type="button"
                                        onClick={handleReset}
                                        className="w-full ml-2 bg-rose-600 hover:bg-rose-700 transition text-white font-semibold py-2 rounded-lg"
                                   >
                                        Reset
                                   </button>
                              </div>
                         </form>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-md">
                         <Chart formValues={formValues} trigger={saveTrigger} />
                    </div>
               
          </section>
     );
};

export default SnfChartPage;
