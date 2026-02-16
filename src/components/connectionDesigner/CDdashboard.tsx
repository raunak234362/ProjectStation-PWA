import { useEffect, useState } from "react";
import Service from "../../api/Service";
import CDSnapshotCards from "./components/CDSnapshotCards";
import CDNetworkOverview from "./components/CDNetworkOverview";
import GetConnectionDesignerByID from "./designer/GetConnectionDesignerByID";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../store/uiSlice";

const DashboardSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-28 bg-gray-200 dark:bg-slate-800 rounded-2xl"
        ></div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
      <div className="bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
    <div className="h-[500px] bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
    <div className="h-48 bg-gray-200 dark:bg-slate-800 rounded-2xl"></div>
  </div>
);

const CDdashboard = () => {
  const [loading, setLoading] = useState(true);
  const [cdData, setCdData] = useState<any[]>([]);
  const [selectedDesignerId, setSelectedDesignerId] = useState<string | null>(
    null,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedDesignerId) {
      dispatch(incrementModalCount());
      return () => {
        dispatch(decrementModalCount());
      };
    }
  }, [selectedDesignerId, dispatch]);

  // Processed Data States

  const [countriesList, setCountriesList] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalCDs: 0,
    totalCountries: 0,
    totalStates: 0,
    totalEngineers: 0,
    activeRFQs: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Service.FetchAllConnectionDesigner();
        const data = Array.isArray(response) ? response : response?.data || [];
        setCdData(data);
        processData(data);
        setTimeout(() => setLoading(false), 800);
      } catch (error) {
        console.error("Failed to fetch CD data", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const processData = (data: any[]) => {
    if (!data) return;

    const totalCDs = data.length;
    const allCountries = new Set<string>();
    const allStates = new Set<string>();
    const stateCounts: { [key: string]: number } = {};
    let totalEngineers = 0;

    data.forEach((cd) => {
      let statesArr: string[] = [];
      if (Array.isArray(cd.state)) {
        statesArr = cd.state;
      } else if (typeof cd.state === "string") {
        try {
          statesArr = cd.state.startsWith("[")
            ? JSON.parse(cd.state)
            : [cd.state];
        } catch {
          statesArr = [cd.state];
        }
      }

      statesArr.forEach((s) => {
        if (s) {
          allStates.add(s);
          stateCounts[s] = (stateCounts[s] || 0) + 1;
        }
      });

      const engineers = cd.CDEngineers || [];
      totalEngineers += engineers.length;

      let country =
        cd.country ||
        (cd.location?.includes(",")
          ? cd.location.split(",")[1].trim()
          : cd.location);
      if (country) allCountries.add(country);
    });

    setCountriesList(Array.from(allCountries).sort());
    setStats({
      totalCDs,
      totalCountries: allCountries.size,
      totalStates: allStates.size,
      totalEngineers,
      activeRFQs: 0,
    });
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-4 sm:p-6 space-y-8 bg-transparent overflow-y-auto custom-scrollbar"
    >
      {/* Snapshot Row */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <CDSnapshotCards stats={stats} countries={countriesList} />
      </motion.div>

      {/* Network Overview List */}
      <CDNetworkOverview designers={cdData} onSelect={setSelectedDesignerId} />

      {/* Designer Details Popup */}
      <AnimatePresence>
        {selectedDesignerId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-1000 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setSelectedDesignerId(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-[40px] shadow-3xl w-[98%] max-w-[95vw] h-[95vh] overflow-y-auto relative custom-scrollbar border border-gray-100 dark:border-slate-800"
            >
              <button
                onClick={() => setSelectedDesignerId(null)}
                className="absolute top-6 right-6 p-2.5 bg-gray-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-2xl transition-all z-50 border border-gray-100 dark:border-slate-700 hover:border-rose-100 dark:hover:border-rose-900/30 shadow-sm"
              >
                <X size={22} strokeWidth={2.5} />
              </button>
              <div className="p-6 md:p-10">
                <GetConnectionDesignerByID id={selectedDesignerId} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CDdashboard;
