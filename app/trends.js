const TrendsScreen = ({ moods }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20 overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Trends & History
      </h1>
      <div className="bg-gray-300 h-48 rounded-2xl flex items-center justify-center text-center text-gray-600 italic mb-6 shadow-inner">
        <p className="p-4">
          [Placeholder for Interactive Charts]
          <br />
          Moods, steps, and heart rate visualized.
        </p>
      </div>
      <div className="bg-blue-50 p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Mood History</h2>
        {moods.length > 0 ? (
          moods
            .slice()
            .reverse()
            .map((log, index) => (
              <div
                key={index}
                className="flex items-start bg-white p-4 rounded-xl shadow-sm mb-4 transition duration-150 hover:shadow-lg"
              >
                <span className="text-3xl mr-4">{log.mood}</span>
                <div>
                  <p className="font-bold text-gray-800">
                    Logged a <span className="font-extrabold">{log.mood}</span>{" "}
                    mood
                  </p>
                  {log.note.length > 0 && (
                    <p className="text-gray-600 italic text-sm mt-1">
                      "{log.note}"
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {log.date} at {log.time}
                  </p>
                </div>
              </div>
            ))
        ) : (
          <p className="text-center text-gray-500 italic">
            No history yet. Start logging!
          </p>
        )}
      </div>
    </div>
  );
};
