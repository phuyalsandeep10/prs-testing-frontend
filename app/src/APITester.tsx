import React, { useState } from 'react';
import { apiClient } from './lib/api-client';

const APITester = () => {
  const [commissionData, setCommissionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCommissionAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/dashboard/commission/?period=monthly&include_details=true');
      console.log('Commission API Response:', response);
      setCommissionData(response);
    } catch (err: any) {
      console.error('Commission API Error:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Tester</h1>
      
      <div className="space-y-4">
        <button
          onClick={testCommissionAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Commission API'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {commissionData && (
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-bold mb-2">Commission API Response:</h3>
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(commissionData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default APITester;
