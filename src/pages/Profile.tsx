export const Profile = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-xl font-bold">
            JD
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">John Doe</h2>
            <p className="text-gray-500 text-sm">+1 234 567 890</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Available as Volunteer</h3>
              <p className="text-sm text-gray-500">Receive alerts for nearby emergencies</p>
            </div>
            <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-primary-600">
              <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200" />
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Blood Type</h3>
            <div className="grid grid-cols-4 gap-2">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((type) => (
                <div
                  key={type}
                  className={`text-center py-2 rounded-lg border text-sm font-medium cursor-pointer ${
                    type === 'O+' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
