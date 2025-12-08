"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // will hold slots where seat-limit reached
  const [fullyBookedDay, setFullyBookedDay] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    service: "",
    date: "",
    time: "",
  });

  const serviceDurations = {
    "Hair Cut": 60,
    "Pedicure": 90,
    "Hair Coloring": 120,
    "Facial": 60,
    "Manicure": 60,
    "Hair Spa": 90,
  };

  const serviceSeatLimits = {
    "Hair Cut": 2,
    "Pedicure": 2,
    "Hair Coloring": 2,
    "Facial": 2,
    "Manicure": 2,
    "Hair Spa": 2,
  };

  const startHour = 9;
  const endHour = 18;

  // Generate time slots dynamically
  const generateTimeSlots = (service) => {
    const duration = serviceDurations[service];
    if (!duration) return [];

    let slots = [];
    const current = new Date();
    current.setHours(startHour, 0, 0, 0);

    const endTime = new Date();
    endTime.setHours(endHour, 0, 0, 0);

    while (current.getTime() + duration * 60000 <= endTime.getTime()) {
      const hour = current.getHours().toString().padStart(2, "0");
      const min = current.getMinutes().toString().padStart(2, "0");
      slots.push(`${hour}:${min}`);
      current.setTime(current.getTime() + duration * 60000);
    }

    return slots;
  };

  // UPDATE SLOTS WHEN SERVICE OR DATE CHANGES
  useEffect(() => {
    if (service && date) {
      const slots = generateTimeSlots(service);
      setTimeSlots(slots);

      // Fetch service-based slot status
      fetch(`/api/booked?date=${date}&service=${service}`)
        .then((res) => res.json())
        .then((data) => {
          setFullyBookedDay(data.fullyBookedDay);

          if (data.fullyBookedDay) {
            alert("Maximum 5 appointments reached for this date");

            // Reset everything
            setService("");
            setDate("");
            setTimeSlots([]);
            setBookedSlots([]);
            setFormData({
              fullName: "",
              email: "",
              service: "",
              date: "",
              time: "",
            });
            return;
          }

          // These slots have seat-limit reached
          setBookedSlots(data.fullSlots || []);

          // Reset time dropdown
          setFormData((prev) => ({
            ...prev,
            service,
            date,
            time: "",
          }));
        })
        .catch((err) => console.error(err));
    } else {
      setTimeSlots([]);
      setBookedSlots([]);
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  }, [service, date]);

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (fullyBookedDay) {
      alert("Cannot book. Maximum 5 appointments reached for this date.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          service: formData.service,
          appointment_date: formData.date,
          appointment_time: formData.time,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Appointment booked successfully!");

        // Reset form
        setFormData({
          fullName: "",
          email: "",
          service: "",
          date: "",
          time: "",
        });
        setService("");
        setDate("");
        setTimeSlots([]);
        setBookedSlots([]);
      } else {
        alert(result.error || "Failed to save appointment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving appointment!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-white text-gray-900 font-sans">

      {/* LEFT SIDE */}
      <div className="w-1/2 min-h-screen bg-black flex flex-col items-center justify-center p-12 text-white">
        <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg text-white">
          GLAMOUR SALOON
        </h1>

        <div className="w-72 h-72 rounded-3xl shadow-2xl mb-6 overflow-hidden transform hover:scale-105 transition-transform duration-500">
          <img src="/images.png" alt="Salon Logo" className="w-full h-full object-cover" />
        </div>

        <button
          onClick={() => router.push("/services")}
          className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:bg-gray-200 transition-all duration-300 text-lg"
        >
          Explore Services
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-1/2 min-h-screen bg-blue-50 p-12 flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-center mb-8">Book Your Appointment</h2>

        <form className="space-y-6 bg-white p-10 rounded-3xl shadow-2xl max-w-lg mx-auto" onSubmit={handleSubmit}>

          {/* Full Name */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold mb-2">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter full name"
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-800"
              required
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email"
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-800"
              required
            />
          </div>

          {/* Service */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold mb-2">Select Service</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-800"
              required
            >
              <option value="">-- Choose a Service --</option>
              {Object.keys(serviceDurations).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold mb-2">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-800"
              required
            />
          </div>

          {/* Time */}
          <div className="flex flex-col">
            <label className="text-gray-800 font-semibold mb-2">Select Time</label>
            <select
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="px-5 py-3 border border-gray-300 rounded-xl text-gray-800"
              required
              disabled={!service || !date || timeSlots.length === 0}
            >
              <option value="">-- Choose a Time Slot --</option>

              {timeSlots.map((slot) => (
                <option
                  key={slot}
                  value={slot}
                  disabled={bookedSlots.includes(slot)}
                >
                  {bookedSlots.includes(slot) ? `❌ ${slot} (full)` : slot}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || fullyBookedDay}
            className="mt-6 w-full bg-black text-white py-3 rounded-xl font-semibold shadow-lg"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}
