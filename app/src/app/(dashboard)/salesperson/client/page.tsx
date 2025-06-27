
import Clientform from '@/components/salesperson/clients/Clientform';
import EditClient from '@/components/salesperson/clients/editClient'
import React from 'react'

const page = () => {
  return (
    <div>
      <Clientform />
      <div className='mt-10'>
        <EditClient />
      </div>
    </div>
  );
}

export default page