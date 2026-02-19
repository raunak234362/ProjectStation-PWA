/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Building2,
  Plus,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { X } from "lucide-react";
import type { Fabricator, Branch } from "../../../interface";
import AddBranch from "./AddBranch";
import { useState } from "react";
import Button from "../../fields/Button";
import { motion, AnimatePresence } from "motion/react";
import { useDispatch } from "react-redux";
import { incrementModalCount, decrementModalCount } from "../../../store/uiSlice";
import { useEffect } from "react";

interface AllBranchProps {
  fabricator: Fabricator;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

const AllBranches = ({
  fabricator,
  onClose,
  onSubmitSuccess,
}: AllBranchProps) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(incrementModalCount());
    return () => {
      dispatch(decrementModalCount());
    };
  }, [dispatch]);

  const [addBranchModal, setAddBranchModal] = useState(false);

  const handleOpenAddBranch = () => setAddBranchModal(true);
  const handleCloseAddBranch = () => setAddBranchModal(false);

  return (
    <div
      className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm shadow-2xl overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative border border-white/20 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
          <div>
            <h2 className="text-3xl  text-slate-900 dark:text-white tracking-tight leading-none mb-2 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                <Building2 className="w-6 h-6" />
              </div>
              Partner Branches
            </h2>
            <p className="text-xs  text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              Managing geographic infrastructure for {fabricator.fabName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleOpenAddBranch}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-2xl text-[10px]  uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-green-100 dark:shadow-none transition-all active:scale-95 border-none"
            >
              <Plus size={16} /> New Branch
            </Button>
            <button
              onClick={onClose}
              className="p-3 bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {fabricator.branches && fabricator.branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fabricator.branches.map((branch: Branch) => (
                <div
                  key={branch.id}
                  className="p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-green-200 dark:hover:border-green-800 hover:shadow-xl hover:shadow-green-500/5 transition-all group flex flex-col h-full relative overflow-hidden"
                >
                  {branch.isHeadquarters && (
                    <div className="absolute top-0 right-0 px-4 py-1 bg-green-500 text-white text-[8px]  uppercase tracking-[0.2em] rounded-bl-2xl">
                      Corporate HQ
                    </div>
                  )}

                  <div className="mb-6 flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-green-50 dark:group-hover:bg-green-900/20 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      <Building2 size={24} />
                    </div>
                  </div>

                  <h3 className="text-xl  text-slate-800 dark:text-white mb-2 truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {branch.name}
                  </h3>

                  <div className="space-y-4 mt-auto">
                    <div className="flex items-start gap-3 text-slate-500 dark:text-slate-400">
                      <MapPin
                        size={16}
                        className="shrink-0 mt-0.5 text-slate-300 dark:text-slate-600"
                      />
                      <p className="text-xs  leading-relaxed truncate-2-lines">
                        {branch.address}, {branch.city}, {branch.state}{" "}
                        {branch.zipCode}, {branch.country}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <Mail size={16} className="shrink-0 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs  truncate">
                        {branch.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <Phone size={16} className="shrink-0 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs ">
                        {branch.phone}{" "}
                        {branch.extension && (
                          <span className="text-slate-300 dark:text-slate-600 font-medium">
                            (Ext: {branch.extension})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <span
                      className={`text-[10px]  uppercase tracking-widest ${branch.isHeadquarters ? "text-green-600" : "text-slate-300 dark:text-slate-600"}`}
                    >
                      {branch.isHeadquarters ? "Active HQ" : "Satellite Office"}
                    </span>
                    {branch.isHeadquarters && (
                      <CheckCircle2 size={16} className="text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
              <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Building2 size={40} className="text-slate-200 dark:text-slate-700" />
              </div>
              <p className="text-sm  uppercase tracking-widest mb-6">
                Geographic Footprint Empty
              </p>
              <Button
                onClick={handleOpenAddBranch}
                className="bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white px-8 py-3 rounded-2xl text-[10px]  uppercase tracking-widest border-none"
              >
                Initialize First Branch
              </Button>
            </div>
          )}
        </div>

        {/* ✅ Add Branch Modal */}
        <AnimatePresence>
          {addBranchModal && (
            <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
              <AddBranch
                fabricatorId={fabricator.id}
                onClose={handleCloseAddBranch}
                onSubmitSuccess={onSubmitSuccess}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AllBranches;
