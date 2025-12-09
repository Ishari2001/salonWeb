"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Dialog from "../components/Dialog"; 

export default function AppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

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

  const SALON_OPEN = 9;
  const SALON_CLOSE = 17;

  // Generate time slots for a service and date
  const generateTimeSlots = (service, selectedDate) => {
    const duration = serviceDurations[service];
    if (!duration) return [];

    const slots = [];
    const now = new Date();

    let current = new Date();
    current.setHours(SALON_OPEN, 0, 0, 0);

    let endTime = new Date();
    endTime.setHours(SALON_CLOSE, 0, 0, 0);

    const todayStr = new Date().toISOString().split("T")[0];
    const isToday = selectedDate === todayStr;

    while (current.getTime() + duration * 60000 <= endTime.getTime()) {
      const slot = `${String(current.getHours()).padStart(2, "0")}:${String(
        current.getMinutes()
      ).padStart(2, "0")}`;

      if (isToday) {
        const slotTime = new Date();
        slotTime.setHours(current.getHours(), current.getMinutes(), 0, 0);
        if (slotTime.getTime() > now.getTime()) slots.push(slot);
      } else {
        slots.push(slot);
      }

      current = new Date(current.getTime() + duration * 60000);
    }

    return slots;
  };

  // Fetch booked slots and check if today is full
  useEffect(() => {
    if (service && date) {
      const slots = generateTimeSlots(service, date);
      setTimeSlots(slots);

      fetch(`/api/booked?date=${date}&service=${service}`)
        .then((res) => res.json())
        .then((data) => {
          const fullSlots = data.fullSlots || [];
          setBookedSlots(fullSlots);
          setFormData((prev) => ({ ...prev, service, date, time: "" }));

          // Check if all slots are booked → suggest tomorrow
          if (slots.length && slots.every((s) => fullSlots.includes(s))) {
            setDialogMessage("Appointments for today are full. Would you like to book for tomorrow?");
            setDialogOpen(true);
          }
        });
    } else {
      setTimeSlots([]);
      setBookedSlots([]);
    }
  }, [service, date]);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.time) {
      setDialogMessage("Please select a time slot.");
      setDialogOpen(true);
      return;
    }

    setLoading(true);
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
        setDialogMessage("Appointment booked successfully!");
        setDialogOpen(true);

        setFormData({ fullName: "", email: "", service: "", date: "", time: "" });
        setService("");
        setDate("");
        setTimeSlots([]);
        setBookedSlots([]);
      } else {
        setDialogMessage(result.error || "Something went wrong!");
        setDialogOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-white text-gray-900 font-sans">

      {/* Left Panel */}
      <div className="w-1/2 h-full bg-black flex flex-col items-center justify-center p-12 text-white">
        <h1 className="text-5xl font-extrabold mb-6 tracking-wide drop-shadow-lg">
          GLAMOUR SALOON
        </h1>

        <div className="w-72 h-72 rounded-3xl shadow-xl mb-6 overflow-hidden">
          <img src="/images.png" className="w-full h-full object-cover" />
        </div>

        <button
          onClick={() => router.push("/services")}
          className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-gray-200"
        >
          Explore Services & View Available Seat
        </button>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 h-full bg-blue-50 p-12 flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-center mb-10">Book Your Appointment</h2>

        <form
          className="space-y-5 backdrop-blur-xl bg-white/60 border border-white/30 p-8 rounded-3xl shadow-2xl max-w-md mx-auto"
          onSubmit={handleSubmit}
        >
          {/* Full Name */}
          <div>
            <label className="font-semibold">Full Name</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="px-5 py-3 border rounded-xl w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="font-semibold">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="px-5 py-3 border rounded-xl w-full"
            />
          </div>

          {/* Service */}
          <div>
            <label className="font-semibold">Select Service</label>
            <select
              value={service}
              required
              onChange={(e) => setService(e.target.value)}
              className="px-5 py-3 border rounded-xl w-full"
            >
              <option value="">-- Choose a Service --</option>
              {Object.keys(serviceDurations).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="font-semibold">Select Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-5 py-3 border rounded-xl w-full"
            />
          </div>

          {/* Time Slots */}
          <div>
            <label className="font-semibold">Time Slots</label>
            <div className="flex flex-wrap gap-3 mt-2">
              {timeSlots.length === 0 && (
                <p className="text-gray-500">No available slots</p>
              )}

              {timeSlots.map((slot) => {
                const isBooked = bookedSlots.includes(slot);

                return (
                  <button
                    key={slot}
                    type="button"
                    disabled={isBooked}
                    onClick={() => setFormData({ ...formData, time: slot })}
                    className={`px-4 py-2 rounded-lg border font-medium ${
                      isBooked
                        ? "bg-red-600 text-white cursor-not-allowed"
                        : formData.time === slot
                        ? "bg-black text-white"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.time}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold"
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>

      {/* Dialog */}
<Dialog
  isOpen={dialogOpen}
  title="Notice"
  message={dialogMessage}
  onClose={() => setDialogOpen(false)}
  onConfirm={async () => {
    if (dialogMessage.includes("tomorrow")) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0];

      // Save current form values before clearing
      const bookingData = { ...formData, date: nextDayStr };

      // Clear the form fields immediately
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

      // Automatically submit booking for the next day
      setLoading(true);
      try {
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: bookingData.fullName,
            email: bookingData.email,
            service: bookingData.service,
            appointment_date: nextDayStr,
            appointment_time: bookingData.time || "Not selected", // fallback if time empty
            confirmNextDay: true,
          }),
        });

        const result = await res.json();

        if (res.ok) {
          // Show booked date and time in dialog
          setDialogMessage(
            `Appointment booked for ${result.appointment_date} at ${bookingData.time || "Not selected"}!`
          );
        } else {
          setDialogMessage(result.error || "Something went wrong!");
        }

        setDialogOpen(true);
      } finally {
        setLoading(false);
      }
    } else {
      setDialogOpen(false);
    }
  }}
/>


    </div>
  );
}
