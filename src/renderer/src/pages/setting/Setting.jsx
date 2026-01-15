import React from 'react';

const Setting = () => {
  return (
    <div className="p-4 bg-gray-100 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">Milk Dairy Settings</h1>

      {/* Business Info Section */}
      <section className="bg-blue-100 p-6 rounded-lg shadow-md w-full">
        {/* <h2 className="text-xl font-semibold text-blue-900 mb-4">Power by Production House</h2> */}
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Business Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Dairy Name" className="input" />
          <input type="text" placeholder="Owner Name" className="input" />
          <input type="email" placeholder="Email Address" className="input" />
          <input type="tel" placeholder="Contact Number" className="input" />
          <input type="text" placeholder="Address" className="input col-span-1 md:col-span-2" />
          <input type="file" className="input col-span-1 md:col-span-2 bg-white" />
        </div>
      </section>

      {/* Milk Rate Settings */}
      <section className="bg-green-100 p-6 rounded-lg shadow-md w-full">
        <h2 className="text-xl font-semibold text-green-900 mb-4">Milk Rate Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select className="input">
            <option>Rate Based on FAT & SNF</option>
            <option>Rate Based on CLR</option>
          </select>
          <input type="number" placeholder="Default Cow Rate" className="input" />
          <input type="number" placeholder="Default Buffalo Rate" className="input" />
          <textarea placeholder="Rate Formula (if any)" className="input md:col-span-2" />
        </div>
      </section>

      {/* Print Settings */}
      <section className="bg-yellow-100 p-6 rounded-lg shadow-md w-full">
        <h2 className="text-xl font-semibold text-yellow-900 mb-4">Print Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" />
            Auto Print after Entry
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" />
            Include Dairy Info in Header
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="form-checkbox" />
            Include FAT/SNF/CLR in Print
          </label>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="bg-purple-100 p-6 rounded-lg shadow-md w-full">
        <h2 className="text-xl font-semibold text-purple-900 mb-4">Notification Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="SMS API Key" className="input" />
          <input type="text" placeholder="Sender ID" className="input" />
          <label className="flex items-center gap-2 col-span-1 md:col-span-2">
            <input type="checkbox" className="form-checkbox" />
            Enable Daily Summary SMS
          </label>
        </div>
      </section>

      {/* Save Button */}
      <div className="w-full text-center">
        <button className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default Setting;
