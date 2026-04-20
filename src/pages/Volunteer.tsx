export const Volunteer = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Tasks</h1>
        <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
          Available for Alerts
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Available Requests */}
        <div className="bg-gray-100 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            New Alerts
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded">O+ Blood</span>
                <span className="text-xs text-gray-500">2km away</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">City Hospital ICU</h3>
              <p className="text-xs text-gray-600 mt-1">Needed within 2 hours</p>
              <button className="mt-4 w-full bg-primary-600 text-white font-medium py-2 rounded-lg text-sm hover:bg-primary-700">
                Accept Request
              </button>
            </div>
          </div>
        </div>

        {/* Accepted/In Progress */}
        <div className="bg-gray-100 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            In Progress
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-yellow-50 text-yellow-700 text-xs font-bold px-2 py-1 rounded">Ambulance Assist</span>
                <span className="text-xs text-gray-500">You</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Highway A4 Accident</h3>
              <button className="mt-4 w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 rounded-lg text-sm hover:bg-gray-50">
                View Details
              </button>
            </div>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-gray-100 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
          <h2 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Completed
          </h2>
          <div className="flex-1 overflow-y-auto space-y-3 pb-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 opacity-75">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded">Blood Donor</span>
                <span className="text-xs text-gray-500">Yesterday</span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Apollo Hospital</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
