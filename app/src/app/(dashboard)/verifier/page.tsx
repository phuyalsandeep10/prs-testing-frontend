import React from 'react'
import Overview from './_components/Overview';
import PaymentSection from './_components/PaymentSection';
import RefundSection from './_components/RefundSection';
import VerificationSection from './_components/VerificationSection';
import AuditSection from './_components/AuditSection';
import PaymentChart from './_components/PaymentChart';

const page = () => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-semibold text-[20px]"> Verifier Dashboard </h1>
          <p className="text-[#7E7E7E] font-normal">
            {" "}
            View your overall stats and metrics at one place. Boost your
            productivity .
          </p>
        </div>

        <div className="relative w-[150px]">
          <svg
            className="absolute left-2 top-1/2 transform -translate-y-1/2"
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.0155 7.78301L10.1568 9.92436L9.44975 10.6315L7.3084 8.49011C6.53845 9.10611 5.562 9.47461 4.5 9.47461C2.016 9.47461 0 7.45861 0 4.97461C0 2.49061 2.016 0.474609 4.5 0.474609C6.984 0.474609 9 2.49061 9 4.97461C9 6.03661 8.6315 7.01306 8.0155 7.78301ZM7.01235 7.41201C7.62375 6.78191 8 5.92241 8 4.97461C8 3.04086 6.43375 1.47461 4.5 1.47461C2.56625 1.47461 1 3.04086 1 4.97461C1 6.90836 2.56625 8.47461 4.5 8.47461C5.4478 8.47461 6.3073 8.09836 6.9374 7.48696L7.01235 7.41201Z"
              fill="#5F6062"
            />
          </svg>

          <input
            type="text"
            placeholder="Search"
            className="pl-7 pr-2 h-[28px] w-full border-[#D1D1D1] rounded-[6px] border border-solid text-sm outline-none"
          />
        </div>
      </div>

      <div className="mt-10">
        <Overview />
      </div>

      <div className='flex justify-between flex-wrap'>
        <div className="mt-10">
          <PaymentChart />
        </div>
        <div className="mt-10">
          <AuditSection />
        </div>
      </div>

      <div className="mt-10">
        <PaymentSection />
      </div>

      <div className="mt-10">
        <RefundSection />
      </div>

      <div className="mt-10">
        <VerificationSection />
      </div>
    </div>
  );
}

export default page