export default function ServicesPage() {
  return (
    <div className="min-h-screen w-full bg-blue-50 py-12 px-4 md:px-20">

      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="bg-blue-700 text-white inline-block px-8 py-3 rounded-full text-lg font-semibold shadow-md">
          Our Services
        </h1>
      </div>

      {/* SERVICES GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">

        {/* HAIRCUT */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <img
            src="destin-hair-studio_salon-images-15_uploaded-03-28-2018.jpg"
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt="Haircut"
          />
          <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">Hair Cut</h2>
          <p className="text-gray-700 mb-2">Professional haircut tailored to your style.</p>
          <p className="text-gray-900 font-semibold">Price: Rs.1000 up</p>
          <p className="text-gray-900 font-semibold">Duration: 1 hr</p>
        </div>

        {/* HAIR COLORING */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <img
            src="71scRiETMiL._AC_UF894,1000_QL80_.jpg"
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt="Hair Coloring"
          />
          <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">Hair Coloring</h2>
          <p className="text-gray-700 mb-2">Vibrant hair coloring with high-quality dyes.</p>
          <p className="text-gray-900 font-semibold">Price: Rs.3500 up</p>
          <p className="text-gray-900 font-semibold">Duration: 2 hrs</p>
        </div>

        {/* PEDICURE */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <img
            src="istockphoto-1384893122-612x612.jpg"
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt="Pedicure"
          />
          <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">Pedicure</h2>
          <p className="text-gray-700 mb-2">Relaxing pedicure with exfoliation and nail care.</p>
          <p className="text-gray-900 font-semibold">Price: Rs.8000</p>
          <p className="text-gray-900 font-semibold">Duration: 1.5 hrs</p>
        </div>

        {/* FACIAL */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <img
            src="facials.png"
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt="Facial"
          />
          <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">Facial</h2>
          <p className="text-gray-700 mb-2">Revitalizing facial to cleanse, exfoliate, and nourish skin.</p>
          <p className="text-gray-900 font-semibold">Price: Rs.2500</p>
          <p className="text-gray-900 font-semibold">Duration: 1 hr</p>
        </div>

        {/* MANICURE */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <img
            src="1657021335083.jpg"
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt="Manicure"
          />
          <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">Manicure</h2>
          <p className="text-gray-700 mb-2">Professional manicure for clean, polished nails.</p>
          <p className="text-gray-900 font-semibold">Price: Rs.1200</p>
          <p className="text-gray-900 font-semibold">Duration: 1 hr</p>
        </div>

        {/* HAIR SPA */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
          <img
            src="images-hairspa.jpg"
            className="w-full h-64 object-cover rounded-lg mb-4"
            alt="Hair Spa"
          />
          <h2 className="text-center text-xl font-semibold text-blue-700 mb-2">Hair Spa</h2>
          <p className="text-gray-700 mb-2">Deep conditioning treatment for healthy and shiny hair.</p>
          <p className="text-gray-900 font-semibold">Price: Rs.3000</p>
          <p className="text-gray-900 font-semibold">Duration: 1.5 hrs</p>
        </div>

      </div>
    </div>
  );
}
