const ResourcesScreen = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Resources</h1>
      <div className="bg-yellow-100 p-6 rounded-2xl shadow-md mb-4 transition duration-150 hover:shadow-lg">
        <h2 className="text-xl font-bold mb-2 text-gray-800">
          School Counseling
        </h2>
        <p className="text-gray-600 mb-4">
          For immediate support or to schedule an appointment, please contact:
        </p>
        <a
          href="tel:5551234567"
          className="block text-amber-700 underline mb-2 hover:text-amber-800 transition"
        >
          Call: (555) 123-4567
        </a>
        <a
          href="mailto:counselingservices@school.edu"
          className="block text-amber-700 underline hover:text-amber-800 transition"
        >
          Email: counselingservices@school.edu
        </a>
      </div>
      <div className="bg-yellow-100 p-6 rounded-2xl shadow-md transition duration-150 hover:shadow-lg">
        <h2 className="text-xl font-bold mb-2 text-gray-800">
          Mental Health Articles
        </h2>
        <p className="text-gray-600 mb-4">
          Learn more about managing stress and improving well-being.
        </p>
        <a
          href="#"
          className="block text-amber-700 underline mb-2 hover:text-amber-800 transition"
        >
          Read: "Mindfulness for Students"
        </a>
        <a
          href="#"
          className="block text-amber-700 underline hover:text-amber-800 transition"
        >
          Read: "The Importance of Sleep"
        </a>
      </div>
    </div>
  );
};
