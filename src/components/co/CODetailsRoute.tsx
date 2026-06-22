import React from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import GetCOByID from './GetCOByID';

const CODetailsRoute = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || undefined;
  const navigate = useNavigate();

  return (
    <div className="h-screen w-full bg-gray-50 overflow-auto">
      {id ? (
        <GetCOByID id={id} projectId={projectId} onClose={() => navigate(-1)} />
      ) : (
        <div className="p-4 flex justify-center items-center h-full">
          <p className="text-gray-500 font-bold uppercase tracking-widest">No Change Order ID provided</p>
        </div>
      )}
    </div>
  );
};

export default CODetailsRoute;
