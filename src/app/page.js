"use client"; // required for useRouter in a client component
import { useRouter } from "next/navigation";

export default function ManicureSection() {
  const router = useRouter();

  const handleBookAppointment = () => {
    router.push("/appointment"); // Navigate to the appointment page
  };

  return (
    <section className="w-full bg-white py-12 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        
        {/* LEFT IMAGE */}
        <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-lg">
          <img
            src="1657021335083.jpg"
            alt="Manicure Service"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="flex flex-col gap-5">
          <h2 className="text-4xl font-bold text-gray-800">
            Indulge in Our Luxury Manicure
          </h2>

          <p className="text-gray-600">
            Treat yourself to a premium manicure experience at our salon. Our expert nail technicians use high-quality products to ensure your hands and nails feel refreshed, nourished, and beautifully polished.
          </p>

          <ul className="text-gray-700 space-y-2">
            <li>💅 Professional nail shaping & polishing</li>
            <li>🌸 Relaxing aromatic hand massage</li>
            <li>🕯️ Spa-like ambience with calming candles</li>
            <li>🌿 Nourishing oils & treatments for healthy nails</li>
          </ul>

          {/* Book Appointment Button */}
          <button
            onClick={handleBookAppointment}
            className="mt-4 bg-black text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-gray-800 transition"
          >
            Book Appointment
          </button>
        </div>
      </div>
    </section>
  );
}
