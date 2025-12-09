"use client";

import { useState, useEffect } from "react";

// Services data
const services = [
  {
    name: "Hair Cut",
    price: "Rs.1000 up",
    duration: "1 hr",
    img: "destin-hair-studio_salon-images-15_uploaded-03-28-2018.jpg",
  },
  {
    name: "Hair Coloring",
    price: "Rs.3500 up",
    duration: "2 hrs",
    img: "71scRiETMiL._AC_UF894,1000_QL80_.jpg",
  },
  {
    name: "Pedicure",
    price: "Rs.8000",
    duration: "1.5 hrs",
    img: "istockphoto-1384893122-612x612.jpg",
  },
  {
    name: "Facial",
    price: "Rs.2500",
    duration: "1 hr",
    img: "facials.png",
  },
  {
    name: "Manicure",
    price: "Rs.1200",
    duration: "1 hr",
    img: "1657021335083.jpg",
  },
  {
    name: "Hair Spa",
    price: "Rs.3000",
    duration: "1.5 hrs",
    img: "images-hairspa.jpg",
  },
];

// Seat limits per service
const serviceSeatLimits = {
  "Hair Cut": 2,
  "Pedicure": 2,
  "Hair Coloring": 2,
  "Facial": 2,
  "Manicure": 2,
  "Hair Spa": 2,
};

export default function ServicesPage() {
  const [bookedData, setBookedData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);

  // Fetch booked slots for each service on the selected date
  useEffect(() => {
    const fetchBooked = async () => {
      setLoading(true);
      const result = {};

      for (let service of services) {
        try {
          const res = await fetch(`/api/booked?date=${selectedDate}&service=${service.name}`);
          const data = await res.json();
          // bookedCounts example: { "09:00": 1, "10:00": 2, ... }
          result[service.name] = data.bookedCounts || {};
        } catch (err) {
          console.error("Error fetching booked slots:", err);
          result[service.name] = {};
        }
      }

      setBookedData(result);
      setLoading(false);
    };

    fetchBooked();
  }, [selectedDate]);

  return (
    <div className="min-h-screen w-full bg-blue-50 py-12 px-4 md:px-20">
      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="bg-blue-700 text-white inline-block px-8 py-3 rounded-full text-lg font-semibold shadow-md">
          Our Services
        </h1>
      </div>

      {/* Date Picker */}
      <div className="text-center mb-12">
        <label className="mr-4 font-semibold">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2 rounded border"
        />
      </div>

      {loading && (
        <div className="text-center text-gray-600 font-semibold mb-6">Loading booked slots...</div>
      )}

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {services.map((service) => {
          const counts = bookedData[service.name] || {};
          const seatLimit = serviceSeatLimits[service.name] || 2;

          return (
            <div
              key={service.name}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <img
                src={service.img}
                className="w-full h-64 object-cover rounded-lg mb-4"
                alt={service.name}
              />
              <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">{service.name}</h2>
              <p className="text-gray-900 font-semibold">Price: {service.price}</p>
              <p className="text-gray-900 font-semibold">Duration: {service.duration}</p>

              {/* Booked Times */}
              {Object.keys(counts).length > 0 ? (
                <div className="mt-4">
                  <h3 className="text-gray-800 font-semibold mb-2">Booked Times & Seats:</h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(counts).map(([time, count]) => {
                      const available = count < seatLimit;
                      return (
                        <div
                          key={time}
                          className={`flex justify-between px-3 py-1 rounded ${
                            available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          <span>{time}</span>
                          <span>
                            {count} booked / {seatLimit} {available ? "(Available)" : "(Full)"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-gray-500">No bookings for this service on {selectedDate}.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
