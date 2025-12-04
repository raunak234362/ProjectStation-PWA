import { useState } from "react";
import { AddConnectionDesigner, AllConnectionDesigner } from "../components";

const ConnectionLayout = () => {
  const [activeTab, setActiveTab] = useState("AllConnectionDesigner");
  const userRole = sessionStorage.getItem("userRole");
  return (
    <div className="w-full overflow-y-hidden overflow-x-hidden">
      <div className="flex flex-col w-full h-full">
        <div className="px-3 flex flex-col justify-between items-start backdrop-blur-2xl bg-linear-to-t from-emerald-200/60 to-teal-600/50 border-b rounded-t-md ">
          <h1 className="text-2xl py-2 font-bold text-white">
            Connection Designer
          </h1>
          <div className="flex w-full overflow-x-auto">
            <button
              onClick={() => setActiveTab("AllConnectionDesigner")}
              className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                activeTab === "AllConnectionDesigner"
                  ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                  : "md:text-base text-sm text-white font-semibold"
              }`}
            >
              All Connection Designer
            </button>

            {(userRole === "ADMIN" || userRole === "human-resource") && (
              <>
                <button
                  onClick={() => setActiveTab("AddConnectionDesigner")}
                  className={`px-1.5 md:px-4 py-2 rounded-lg rounded-b ${
                    activeTab === "AddConnectionDesigner"
                      ? "text-base md:text-base bg-white/70 backdrop-xl text-gray-800 font-bold"
                      : "md:text-base text-sm text-white font-semibold"
                  }`}
                >
                  Add Connection Designer
                </button>
              </>
            )}
          </div>
        </div>
        <div className="flex-grow p-2 bg-white rounded-b-2xl">
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
