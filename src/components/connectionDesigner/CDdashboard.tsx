import { useEffect, useState } from "react";
import Service from "../../api/Service";
import CDSnapshotCards from "./components/CDSnapshotCards";
import CDLocationCharts from "./components/CDLocationCharts";
import CDCapacityTable from "./components/CDCapacityTable";
import CDInsightsList from "./components/CDInsightsList";
import DataTable from "../ui/table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ConnectionDesigner } from "../../interface";
import GetConnectionDesignerByID from "./designer/GetConnectionDesignerByID";

const CDdashboard = () => {
    const [loading, setLoading] = useState(true);
    const [cdData, setCdData] = useState<any[]>([]);

    const columns: ColumnDef<ConnectionDesigner>[] = [
        { accessorKey: "name", header: "Name" },
        { accessorKey: "email", header: "Email" },
        // { accessorKey: "headquater.country", header: "Country" }, // Optional additions if desired
    ];

    // Processed Data States
    const [stats, setStats] = useState({
        totalCDs: 0,
        totalCountries: 0,
        totalStates: 0,
        totalEngineers: 0,
        activeRFQs: 0
    });
    const [stateDist, setStateDist] = useState<any[]>([]);
    const [countryDist, setCountryDist] = useState<any[]>([]);
    const [capacityData, setCapacityData] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [insights, setInsights] = useState({
        noEngineers: [] as string[],
        limitedCoverage: [] as string[],
        recentlyAdded: [] as string[]
    });


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await Service.FetchAllConnectionDesigner();
                // Ensure response is array
                const data = Array.isArray(response) ? response : (response?.data || []);
                setCdData(data);
                processData(data);
            } catch (error) {
                console.error("Failed to fetch CD data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processData = (data: any[]) => {
        if (!data) return;

        // 1. Snapshot Stats
        const totalCDs = data.length;

        // Sets for unique counts
        const allCountries = new Set<string>();
        const allStates = new Set<string>();
        let totalEngineers = 0;

        // For Charts
        const stateCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};

        // For Insights
        const noEngineers: string[] = [];
        const limitedCoverage: string[] = [];

        data.forEach(cd => {
            // Location - Assuming cd.location or cd.headquater.country/states
            // Based on AddConnectionDesigner logic: location string or separate fields if API returns structure
            // Let's assume the API returns the structure saved: name, state (array), location (string), etc.

            // Extract Country/State from available fields
            // Often backend might flatten it. Let's try to parse 'state' if it's there.
            let statesArr: string[] = [];
            if (Array.isArray(cd.state)) {
                statesArr = cd.state;
            } else if (typeof cd.state === 'string') {
                try {
                    // Sometimes saved as JSON string in DB? or just a single string
                    if (cd.state.startsWith('[')) {
                        statesArr = JSON.parse(cd.state);
                    } else {
                        statesArr = [cd.state];
                    }
                } catch {
                    statesArr = [cd.state];
                }
            }

            // Count States
            statesArr.forEach(s => {
                if (s) {
                    allStates.add(s);
                    stateCounts[s] = (stateCounts[s] || 0) + 1;
                }
            });

            // Count Country
            // If country is not separate, try to extract from location "City, Country"
            let country = cd.country || "";
            if (!country && cd.location && cd.location.includes(',')) {
                country = cd.location.split(',')[1].trim();
            } else if (!country && cd.location) {
                country = cd.location; // Fallback
            }

            // Normalize country names if needed, simple trim for now
            if (country) {
                allCountries.add(country);
                countryCounts[country] = (countryCounts[country] || 0) + 1;
            }

            // Engineers count using CDEngineers array
            const engineers = cd.CDEngineers || []; // Safety check
            const engCount = engineers.length;
            totalEngineers += engCount;

            // Insights Logic
            if (engCount === 0) noEngineers.push(cd.name);
            if (statesArr.length <= 1) limitedCoverage.push(cd.name);

        });

        setStats({
            totalCDs,
            totalCountries: allCountries.size,
            totalStates: allStates.size,
            totalEngineers,
            activeRFQs: 0 // Placeholder as requested derived later
        });

        // 2. Charts Data
        const stateChartData = Object.entries(stateCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 states

        const countryChartData = Object.entries(countryCounts)
            .map(([name, count]) => ({ name, count }));

        setStateDist(stateChartData);
        setCountryDist(countryChartData);

        // 3. Capacity Table Data
        const capData = data.map(cd => {
            const count = cd.CDEngineers?.length || 0;
            let status: 'Balanced' | 'Lean' | 'Risk' = 'Balanced';
            if (count === 0) status = 'Risk';
            else if (count <= 2) status = 'Lean';

            return {
                id: cd._id || cd.id, // Assuming ID field
                name: cd.name,
                engineerCount: count,
                status,
                updatedAt: cd.updatedAt
            };
        });
        setCapacityData(capData);

        // 4. Recent Activity (Sort by updatedAt)
        const sortedByUpdate = [...capData].sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
        setRecentActivity(sortedByUpdate);

        // 5. Insights
        // Sorted by createdAt for "Recently Added"
        const sortedByCreated = [...data].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        const recentlyAdded = sortedByCreated.slice(0, 5).map(cd => cd.name);

        setInsights({
            noEngineers,
            limitedCoverage,
            recentlyAdded
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500 font-medium">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="h-full p-6 space-y-6 bg-gray-50 overflow-y-auto min-h-screen">
            {/* Header if needed */}

            {/* SECTION B — EXECUTIVE SNAPSHOT */}
            <CDSnapshotCards stats={stats} />

            {/* SECTION C — LOCATION INTELLIGENCE */}
            <CDLocationCharts stateData={stateDist} countryData={countryDist} />

            {/* SECTION D — DESIGNER CAPACITY & UTILIZATION */}
            <CDCapacityTable capacityData={capacityData} recentActivity={recentActivity} />

            {/* SECTION E — ACTIONABLE INSIGHTS */}
            <CDInsightsList insights={insights} />

            {/* SECTION F — ALL CONNECTION DESIGNERS */}
            <div className="pt-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4 px-1">All Connection Designers</h3>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <DataTable
                        columns={columns}
                        data={cdData}
                        detailComponent={({ row }) => {
                            const fabricatorUniqueId = (row as any).id ?? (row as any).fabId ?? "";
                            return <GetConnectionDesignerByID id={fabricatorUniqueId} />;
                        }}
                        searchPlaceholder="Search connection designers..."
                        pageSizeOptions={[5, 10, 25]}
                    />
                </div>
            </div>

        </div>
    );
};

export default CDdashboard;
