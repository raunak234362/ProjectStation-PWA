import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GetCDRFQByID from './GetCDRFQByID';

const CDRFQDetailsRoute = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gray-50 overflow-auto">
      {id ? (
        <GetCDRFQByID id={id} close={() => navigate(-1)} />
      ) : (
        <div className="p-4 flex justify-center items-center h-full">
          <p className="text-gray-500 font-bold uppercase tracking-widest">No CD RFQ ID provided</p>
        </div>
      )}
    </div>
  );
};

export default CDRFQDetailsRoute;
