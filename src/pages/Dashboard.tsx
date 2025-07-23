// src/pages/Dashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config";
import MonitoredBusCard from "../components/MonitoredBusCard";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import FuelChart from "../components/FuelChart";
import StatCards from "../components/StatCards";
import { BusFront } from "lucide-react";
import CountUp from "react-countup";

interface Reading {
  timestamp: string;
  fuelLevel: number;
  eventType?: "THEFT" | "REFUEL" | "LOW_FUEL" | "UNKNOWN";
  description?: string;
}

interface Bus {
  busId: string;
  registrationNo: string;
  driverName: string;
  routeName: string;
  fuelLevel: number;
  status: "normal" | "alert" | "offline";
}

interface DashboardStats {
  totalBuses: number;
  topBuses: Bus[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    topBuses: [],
  });

  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [fuelData, setFuelData] = useState<Reading[]>([]);
  const [events, setEvents] = useState<Reading[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get<DashboardStats>(`${API_BASE_URL}/dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!selectedBus) return;

    const { startDate: computedStart, endDate: computedEnd } = getDateRange("This Week");

    const fetchBusDetails = async () => {
      try {
        const res = await axios.get<{ readings: Reading[] }>(
          `${API_BASE_URL}/buses/${selectedBus}/details`,
          {
            params: {
              timeRange: "This Week",
              startDate: computedStart?.toISOString(),
              endDate: computedEnd?.toISOString(),
            },
          }
        );

        const readings = res.data.readings || [];
        setFuelData(readings);
        setEvents(readings.filter((r) => r.eventType && r.eventType !== "UNKNOWN"));
      } catch (err) {
        console.error("Error fetching bus details:", err);
      }
    };

    fetchBusDetails();
  }, [selectedBus]);

  return (
    <div className="space-y-10 px-6 py-8 max-w-7xl mx-auto text-gray-800 dark:text-gray-100">
      <div className="relative z-10 text-center py-12 px-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl shadow-lg max-w-4xl mx-auto space-y-6">
        <p className="text-lg md:text-xl leading-relaxed font-medium">
          Welcome to <span className="font-signord font-semibold text-blue-600 dark:text-blue-300">FuelSafe</span> — your centralized platform to monitor fuel usage, detect theft, and track refueling activities.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
            🔍 Real-time Monitoring
          </span>
          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-full text-sm font-medium">
            ⚠️ Anomaly Detection
          </span>
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-4 py-2 rounded-full text-sm font-medium">
            ✅ {stats.totalBuses} Buses Monitored
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow-md flex flex-col gap-2 hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-center">
            <BusFront className="w-8 h-8 text-white" />
            <div className="w-8 h-8" />
          </div>
          <h3 className="text-sm">Total Buses</h3>
          <p className="text-2xl font-bold">
            <CountUp end={stats.totalBuses} duration={1.2} separator="," />
          </p>
        </div>

        <StatCards
          title="Ongoing Alerts"
          icon="alert"
          color="from-red-500 to-red-700"
          apiPath="/alerts/count"
        />
        <StatCards
          title="Fuel Theft Events"
          icon="fuel"
          color="from-yellow-500 to-yellow-700"
          apiPath="/alerts/count?type=THEFT"
        />
        <StatCards
          title="Refueling Events"
          icon="refuel"
          color="from-green-500 to-green-700"
          apiPath="/alerts/count?type=REFUEL"
        />
      </div>

      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-100">🚌 Monitored Buses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.topBuses.map((bus, idx) => (
            <MonitoredBusCard
              key={idx}
              busId={bus.busId}
              regNumber={bus.registrationNo}
              driver={bus.driverName}
              route={bus.routeName}
              fuelLevel={bus.fuelLevel}
              status={bus.status}
              imageUrl=""
              onClick={() => setSelectedBus((prev) => (prev === bus.busId ? null : bus.busId))}
              selected={selectedBus === bus.busId}
            />
          ))}
        </div>
      </div>

      {selectedBus && (
        <div className="mt-10 space-y-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-4">
              Fuel Level Over Time – <span className="text-blue-600 dark:text-blue-400">{selectedBus}</span>
            </h3>
            <FuelChart
              fuelData={fuelData.map((r) => ({
                ...r,
                eventType: ["THEFT", "REFUEL", "DROP"].includes(r.eventType as string)
                  ? (r.eventType as "THEFT" | "REFUEL" | "DROP")
                  : "NORMAL",
              }))}
              busId={selectedBus}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;