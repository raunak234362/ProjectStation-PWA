import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ConnectionDesignerQuotaByID from './ConnectionDesignerQuotaByID';

const CDQuotaDetailsRoute = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gray-50 overflow-auto">
      {id ? (
        <ConnectionDesignerQuotaByID id={id} close={() => navigate(-1)} />
      ) : (
        <div className="p-4 flex justify-center items-center h-full">
          <p className="text-gray-500 font-bold uppercase tracking-widest">No CD Quota ID provided</p>
        </div>
      )}
    </div>
  );
};

export default CDQuotaDetailsRoute;
