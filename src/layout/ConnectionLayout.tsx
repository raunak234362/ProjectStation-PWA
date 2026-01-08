import { useState } from "react";
import { AddConnectionDesigner, AllConnectionDesigner } from "../components";

const ConnectionLayout = () => {
  const [activeTab, setActiveTab] = useState("AllConnectionDesigner");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 py-2 backdrop-blur-2xl bg-linear-to-t from-white/60 to-white/80 border-b rounded-t-2xl flex flex-col md:flex-row items-center justify-end gap-4">
          <div className="flex flex-row gap-3 items-end justify-end">
            <button
              onClick={() => setActiveTab("AllConnectionDesigner")}
              className={`px-1.5 md:px-4 py-2 rounded-lg ${
                activeTab === "AllConnectionDesigner"
                  ? "md:text-base text-sm bg-teal-700 text-white font-bold"
                  : "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-semibold"
              }`}
            >
              All Connection Designer
            </button>

            {(userRole === "ADMIN" || userRole === "human-resource") && (
              <button
                onClick={() => setActiveTab("AddConnectionDesigner")}
                className={`px-1.5 md:px-4 py-2 rounded-lg ${
                  activeTab === "AddConnectionDesigner"
                    ? "md:text-base text-sm bg-teal-700 text-white font-bold"
                    : "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-semibold"
                }`}
              >
                Add Connection Designer
              </button>
            )}
          </div>
        </div>
        <div className="grow p-2 bg-white rounded-b-2xl">
          {activeTab === "AllConnectionDesigner" && (
            <div>
              <AllConnectionDesigner />
            </div>
          )}
          {activeTab === "AddConnectionDesigner" && (
            <div>
              {" "}
              <AddConnectionDesigner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionLayout;
