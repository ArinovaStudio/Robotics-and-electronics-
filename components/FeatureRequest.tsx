'use client'
import React, { useState } from 'react'
import { FeatureModal } from './FeatureModal';

const FeatureRequest = () => {
  const [featureModal, setFeatureModal] = useState(false);
  
  return (
    <>
      <aside className="w-[260px] bg-[#f8f8f8] max-md:min-h-screen md:rounded-xl flex flex-col p-5 shadow-sm border border-gray-100 mt-4">
        <h3 className="text-lg font-bold text-[#050A30] mb-4">Product Request</h3>
        <p className="text-[#666] text-sm mb-4">
          Have an idea for a new product? Let us know!
        </p>
        <button 
          onClick={() => setFeatureModal(true)}
          className="bg-[#f0b31e] text-white font-semibold text-sm px-4 py-2 rounded-lg shadow hover:bg-[#e0a01a] transition-all"
        >
          Submit Request
        </button>
      </aside>

      {/* Feature Modal */}
      <FeatureModal 
        open={featureModal} 
        onClose={() => setFeatureModal(false)} 
      />
    </>
  )
}

export default FeatureRequest