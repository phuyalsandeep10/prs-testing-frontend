import React from 'react'
import Overview from './_components/Overview';
import PaymentSection from './_components/PaymentSection';
import RefundSection from './_components/RefundSection';
import VerificationSection from './_components/VerificationSection';
import AuditSection from './_components/AuditSection';
import PaymentChart from './_components/PaymentChart';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { VerifierDataProvider } from './_components/VerifierDataProvider';

const page = () => {
  return (
    <VerifierDataProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Page Container with consistent padding */}
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Verifier Dashboard
              </h1>
              <p className="text-gray-600 font-normal text-sm">
                View your overall stats and metrics at one place. Boost your
                productivity.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 11 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.0155 7.78301L10.1568 9.92436L9.44975 10.6315L7.3084 8.49011C6.53845 9.10611 5.562 9.47461 4.5 9.47461C2.016 9.47461 0 7.45861 0 4.97461C0 2.49061 2.016 0.474609 4.5 0.474609C6.984 0.474609 9 2.49061 9 4.97461C9 6.03661 8.6315 7.01306 8.0155 7.78301ZM7.01235 7.41201C7.62375 6.78191 8 5.92241 8 4.97461C8 3.04086 6.43375 1.47461 4.5 1.47461C2.56625 1.47461 1 3.04086 1 4.97461C1 6.90836 2.56625 8.47461 4.5 8.47461C5.4478 8.47461 6.3073 8.09836 6.9374 7.48696L7.01235 7.41201Z"
                  fill="#6B7280"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Main Content Area with consistent spacing */}
          <div className="space-y-8">
            {/* Overview Section */}
            <section>
              <ErrorBoundary>
                <Overview />
              </ErrorBoundary>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="w-full">
                <ErrorBoundary>
                  <PaymentChart />
                </ErrorBoundary>
              </div>
              <div className="w-full">
                <ErrorBoundary>
                  <AuditSection />
                </ErrorBoundary>
              </div>
            </section>

            {/* Payment Section */}
            <section>
              <ErrorBoundary>
                <PaymentSection />
              </ErrorBoundary>
            </section>

            {/* Refund Section */}
            <section>
              <ErrorBoundary>
                <RefundSection />
              </ErrorBoundary>
            </section>

            {/* Verification Section */}
            <section>
              <ErrorBoundary>
                <VerificationSection />
              </ErrorBoundary>
            </section>
          </div>
        </div>
      </div>
    </VerifierDataProvider>
  );
}

export default page