import { getDBPool } from "../../../../lib/db";

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

const SALON_OPEN = 9;
const SALON_CLOSE = 17;
const DAILY_LIMIT_MINUTES = 480;

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export async function POST(req) {
  try {
    const data = await req.json();
    let { full_name, email, service, appointment_date, appointment_time, confirmNextDay } = data;

    full_name = full_name?.trim();
    email = email?.trim();
    service = service?.trim();
    appointment_date = appointment_date?.trim();
    appointment_time = appointment_time?.trim();

    if (!full_name || !email || !service || !appointment_date || !appointment_time) {
      return new Response(JSON.stringify({ error: "All fields are required" }), { status: 400 });
    }

    const duration = serviceDurations[service];
    if (!duration) return new Response(JSON.stringify({ error: "Invalid service" }), { status: 400 });

    const [h, m] = appointment_time.split(":").map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + duration;

    if (h < SALON_OPEN || endMinutes > SALON_CLOSE * 60) {
      return new Response(
        JSON.stringify({ error: "Service must be within salon hours (9 AM - 5 PM)" }),
        { status: 400 }
      );
    }

    const pool = getDBPool();
    const seatLimit = serviceSeatLimits[service] ?? 1;
    let currentDate = new Date(appointment_date);

    // Check availability
    const [existingRows] = await pool.execute(
      `SELECT appointment_time, service FROM bookings WHERE appointment_date=?`,
      [formatDate(currentDate)]
    );

    // Overlap check
    let overlapCount = 0;
    for (const row of existingRows) {
      if (row.service !== service) continue;
      const existingStart = timeToMinutes(row.appointment_time);
      const existingEnd = existingStart + serviceDurations[row.service];
      if (Math.max(existingStart, startMinutes) < Math.min(existingEnd, endMinutes)) {
        overlapCount++;
      }
    }

    if (overlapCount >= seatLimit) {
      return new Response(
        JSON.stringify({ error: `All ${seatLimit} seats are already booked for ${service} at this time` }),
        { status: 409 }
      );
    }

    // Daily limit
    let totalBookedMinutes = existingRows.reduce(
      (sum, row) => sum + serviceDurations[row.service],
      0
    );

    if (totalBookedMinutes + duration > DAILY_LIMIT_MINUTES) {
      if (!confirmNextDay) {
        // Suggest next day
        const nextDay = new Date(currentDate);
        nextDay.setDate(currentDate.getDate() + 1);
        return new Response(
          JSON.stringify({
            error: "Appointments for today are full. Would you like to book for tomorrow?",
            message: "Would you like to book for tomorrow?",
            suggestedDate: formatDate(nextDay)
          }),
          { status: 409 }
        );
      } else {
        // User confirmed → book next available day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    // Save booking
    await pool.execute(
      `INSERT INTO bookings (full_name, email, service, appointment_date, appointment_time)
       VALUES (?, ?, ?, ?, ?)`,
      [full_name, email, service, formatDate(currentDate), appointment_time]
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: `Booking saved on ${formatDate(currentDate)}`,
        appointment_date: formatDate(currentDate)
      }),
      { status: 201 }
    );

  } catch (err) {
    console.error("Booking API Error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
