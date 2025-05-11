import React, { useState } from 'react';
import Chart from './Chart';

const SnfChartPage = () => {
     const [formValues, setFormValues] = useState({
          A: 4,
          B: 0.2,
          C: 0.66,
     });

     const [saveTrigger, setSaveTrigger] = useState(0);

     const handleChange = (e) => {
          const { name, value } = e.target;
          setFormValues({
               ...formValues,
               [name]: value,
          });
     };

     const handleSave = (e) => {
          e.preventDefault();
          setSaveTrigger(prev => prev + 1); // trigger Chart to recalculate
          alert(`Saved!\nA: ${formValues.A}, B: ${formValues.B}, C: ${formValues.C}`);
     };

     const handleReset = () => {
          setFormValues({
               A: 4,
               B: 0.2,
               C: 0.66,
          });
     };

     return (
          <>
               <section>
                    <div style={{ display: 'flex', alignItems: 'center', height: 'auto' }}>
                         <form onSubmit={handleSave} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '10px', width: '300px', backgroundColor: '#f9f9f9' }}>
                              <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>SNF Formula</h2>
                              <p style={{ textAlign: 'center' }}>(CLR / A) + (B * FAT) + C</p>

                              <label>
                                   A:
                                   <input
                                        type="number"
                                        name="A"
                                        value={formValues.A}
                                        onChange={handleChange}
                                        step="any"
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #777', borderRadius: '3px' }}
                                   />
                              </label>

                              <label>
                                   B:
                                   <input
                                        type="number"
                                        name="B"
                                        value={formValues.B}
                                        onChange={handleChange}
                                        step="any"
                                        style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #777', borderRadius: '3px' }}
                                   />
                              </label>

                              <label>
                                   C:
                                   <input
                                        type="number"
                                        name="C"
                                        value={formValues.C}
                                        onChange={handleChange}
                                        step="any"
                                        style={{ width: '100%', padding: '8px', marginBottom: '20px', border: '1px solid #777', borderRadius: '3px' }}
                                   />
                              </label>

                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                   <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '5px' }}>
                                        Save
                                   </button>
                                   <button type="button" onClick={handleReset} style={{ padding: '8px 16px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '5px' }}>
                                        Reset
                                   </button>
                              </div>
                         </form>
                    </div>
               </section>

               <Chart formValues={formValues} trigger={saveTrigger} />
          </>
     );
};

export default SnfChartPage;
