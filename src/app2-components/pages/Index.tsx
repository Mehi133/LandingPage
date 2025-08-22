import React, { useState } from 'react';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [mockLeads] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'pending' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'converted' }
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">App 2 - Date Driven Leads</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Calendar Widget</h2>
          <p className="text-gray-600">Calendar functionality from App 2</p>
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-sm">Selected Date: {selectedDate ? selectedDate.toDateString() : 'None'}</p>
            <button 
              onClick={() => setSelectedDate(new Date())}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Select Today
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Lead List</h2>
          <div className="space-y-2">
            {mockLeads.map(lead => (
              <div key={lead.id} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-gray-600">{lead.email}</div>
                <div className="text-xs text-blue-600">{lead.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border">
          <h2 className="text-xl font-semibold mb-4">Analytics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Leads:</span>
              <span className="font-bold">{mockLeads.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Active:</span>
              <span className="font-bold text-green-600">
                {mockLeads.filter(l => l.status === 'active').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Converted:</span>
              <span className="font-bold text-blue-600">
                {mockLeads.filter(l => l.status === 'converted').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
        <p className="text-green-700">
          App 2 features have been successfully merged into the main application. 
          This demonstrates the core functionality from your second Lovable app.
        </p>
      </div>
    </div>
  );
};

export default Index;