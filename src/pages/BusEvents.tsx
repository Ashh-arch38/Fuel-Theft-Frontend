// pages/BusEvents.tsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { format, isWithinInterval } from "date-fns";
import { API_BASE_URL } from "../config";
import { getDateRange } from "../utils/dateRangeFromTimeOption";
import LocationMapModal from "../components/LocationMapModal";


interface Alert {
  type: "THEFT" | "REFUEL" | "DROP" | "SENSOR_HEALTH" | string;
  timestamp: string;
  description: string;
  location: { lat: number; long: number };
  bus: {
    id: string;
    registrationNo: string;
    driver: string;
    route: string;
  };
}

const BusEvents: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/alerts/all`);
        setAlerts(res.data as Alert[]);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };
    fetchAlerts();
  }, []);

  const busSuggestions = useMemo(() => {
    const buses = alerts.map((alert) => alert.bus.registrationNo);
    return [...new Set(buses)];
  }, [alerts]);

//   const filteredAlerts = useMemo(() => {
//     if (!selectedBus) return [];
//     return alerts.filter((alert) => {
//       const busMatch = alert.bus.registrationNo.toLowerCase().includes(selectedBus.toLowerCase());
//       const typeMatch = !typeFilter || alert.type === typeFilter;
//       const eventDate = new Date(alert.timestamp);
//       const { startDate, endDate } =
//   dateFilter === "custom"
//     ? {
//         startDate: customStartDate ? new Date(customStartDate) : undefined,
//         endDate: customEndDate ? new Date(customEndDate) : undefined,
//       }
//     : getDateRange(dateFilter.charAt(0).toUpperCase() + dateFilter.slice(1));

// const dateMatch =
//   !startDate || !endDate || isWithinInterval(eventDate, { start: startDate, end: endDate });


//       return busMatch && typeMatch && dateMatch;
//     });
//   }, [alerts, selectedBus, typeFilter, dateFilter, customStartDate, customEndDate]);
 const filteredAlerts = useMemo(() => {
  if (!selectedBus) return [];

  return alerts.filter((alert) => {
    const busMatch = alert.bus.registrationNo.toLowerCase().includes(selectedBus.toLowerCase());
    const typeMatch = !typeFilter || alert.type === typeFilter;

    if (dateFilter.toLowerCase() === "all") {
      return busMatch && typeMatch; // ✅ Do NOT apply any date filtering
    }

    const eventDate = new Date(alert.timestamp);

    const { startDate, endDate } =
      dateFilter === "custom"
        ? {
            startDate: customStartDate ? new Date(customStartDate) : undefined,
            endDate: customEndDate ? new Date(customEndDate) : undefined,
          }
        : getDateRange(
            dateFilter.trim().toLowerCase().replace(/^./, (c) => c.toUpperCase()) // E.g., "today" -> "Today"
          );

    const dateMatch =
      !startDate || !endDate || isWithinInterval(eventDate, { start: startDate, end: endDate });

    return busMatch && typeMatch && dateMatch;
  });
}, [alerts, selectedBus, typeFilter, dateFilter, customStartDate, customEndDate]);




  const paginatedAlerts = useMemo(() => {
    return filteredAlerts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredAlerts, currentPage]);

  const pageCount = Math.ceil(filteredAlerts.length / itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(e.target.value.length > 0);
  };

  const selectBus = (bus: string) => {
    setSelectedBus(bus);
    setSearchTerm(bus);
    setShowSuggestions(false);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedBus(null);
    setSearchTerm("");
    setTypeFilter("");
    setDateFilter("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  const eventIcon = (type: string) => {
    if (type === "REFUEL") return "⛽";
    if (type === "THEFT") return "🚨";
    if (type === "SENSOR_HEALTH") return "🛠️";
    return "🔻";
  };
  const [showMap, setShowMap] = useState(false);
const [mapCoords, setMapCoords] = useState<{ lat: number; long: number } | null>(null);


  return (

    <div className="px-4 py-6 max-w-6xl mx-auto space-y-6 text-gray-800 dark:text-gray-100" >
      <h2 className="text-3xl font-bold">🛑 Alerts History</h2>

      {/* Filter Box */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-100 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bus Search */}
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Bus Registration*</label>
            <input
              type="text"
              value={searchTerm}
              placeholder="Search bus..."
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              className="border px-3 py-2 rounded shadow-sm w-full dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            />
            {showSuggestions && searchTerm && (
              <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded shadow max-h-60 overflow-auto">
                {busSuggestions
                  .filter((bus) =>
                    bus.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((bus, index) => (
                    <li
                      key={index}
                      onClick={() => selectBus(bus)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      {bus}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium mb-1">Event Type</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              disabled={!selectedBus}
            >
              <option value="">All Types</option>
              <option value="THEFT">Theft</option>
              <option value="REFUEL">Refuel</option>
              <option value="SENSOR_HEALTH">Sensor Health</option>

            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700 dark:text-white"
              disabled={!selectedBus}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white text-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {dateFilter === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                disabled={!selectedBus}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border rounded px-3 py-2 w-full dark:bg-gray-900 dark:border-gray-700 dark:text-white"
                disabled={!selectedBus}
              />
            </div>
          </div>
        )}
      </div>

      {/* Alert Table */}
      {/* {selectedBus ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
              <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-300 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Bus</th>
                  <th className="px-6 py-3 text-left">Driver</th>
                  <th className="px-6 py-3 text-left">Route</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Location</th>
                  <th className="px-6 py-3 text-left">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {paginatedAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No alerts found.
                    </td>
                  </tr>
                ) : (
                  paginatedAlerts.map((alert, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{eventIcon(alert.type)}</span>
                          <span className="capitalize text-sm">{alert.type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{alert.bus.registrationNo}</td>
                      <td className="px-6 py-4">{alert.bus.driver}</td>
                      <td className="px-6 py-4">{alert.bus.route}</td>
                      <td className="px-6 py-4">{alert.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {alert.location.lat.toFixed(3)}, {alert.location.long.toFixed(3)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(alert.timestamp), "PPpp")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
        </div>
        
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
          Please select a bus to view alerts.
        </div>
      )} */}
      {/* Alert Table */}
{selectedBus ? (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
        <thead className="bg-gray-50 dark:bg-gray-700 text-xs text-gray-500 dark:text-gray-300 uppercase">
          <tr>
            <th className="px-6 py-3 text-left">Type</th>
            <th className="px-6 py-3 text-left">Bus</th>
            <th className="px-6 py-3 text-left">Driver</th>
            <th className="px-6 py-3 text-left">Route</th>
            <th className="px-6 py-3 text-left">Description</th>
            <th className="px-6 py-3 text-left">Location</th>
            <th className="px-6 py-3 text-left">Time</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
          {paginatedAlerts.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No alerts found.
              </td>
            </tr>
          ) : (
            paginatedAlerts.map((alert, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{eventIcon(alert.type)}</span>
                    <span className="capitalize text-sm">{alert.type}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{alert.bus.registrationNo}</td>
                <td className="px-6 py-4">{alert.bus.driver}</td>
                <td className="px-6 py-4">{alert.bus.route}</td>
                <td className="px-6 py-4">{alert.description}</td>
               <td className="px-6 py-4 text-sm text-blue-600 dark:text-blue-400 underline cursor-pointer"
    onClick={() => {
      setMapCoords(alert.location);
      setShowMap(true);
    }}>
  {alert.location.lat.toFixed(3)}, {alert.location.long.toFixed(3)}
</td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(alert.timestamp), "PPpp")}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>

    {mapCoords && (
  <LocationMapModal
    lat={mapCoords.lat}
    long={mapCoords.long}
    isOpen={showMap}
    onClose={() => setShowMap(false)}
  />
)}


    {/* ✅ Pagination inside selectedBus block */}
    {pageCount > 1 && (
      <div className="flex justify-between items-center px-6 py-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white disabled:opacity-50"
        >
          Previous
        </button>

        <div className="text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {pageCount}
        </div>

        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
          disabled={currentPage === pageCount}
          className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm text-gray-800 dark:text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    )}
  </div>
) : (
  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow p-6 text-center text-gray-500 dark:text-gray-400">
    Please select a bus to view alerts.
  </div>
)}

    </div>

  );
};

export default BusEvents;