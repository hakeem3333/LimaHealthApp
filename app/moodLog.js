const MoodLogScreen = ({ onSave, onNavigateBack }) => {
  const [newMood, setNewMood] = useState(null);
  const [newMoodNote, setNewMoodNote] = useState("");

  const moodsList = [
    { emoji: "😁", label: "Happy" },
    { emoji: "😊", label: "Good" },
    { emoji: "😐", label: "Okay" },
    { emoji: "😔", label: "Sad" },
    { emoji: "😡", label: "Angry" },
    { emoji: "😨", label: "Anxious" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pb-20 overflow-y-auto">
      <div className="flex items-center mb-6">
        <button
          className="text-indigo-600 text-2xl mr-4"
          onClick={onNavigateBack}
        >
          &larr;
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Log Your Mood</h1>
      </div>

      <div className="flex flex-wrap justify-center space-x-2 space-y-2 mb-6">
        {moodsList.map((mood) => (
          <button
            key={mood.emoji}
            className={`flex flex-col items-center p-3 rounded-xl shadow-md transition duration-200 transform hover:scale-105 ${
              newMood === mood.emoji
                ? "bg-indigo-600 shadow-indigo-400"
                : "bg-white hover:bg-gray-100"
            }`}
            onClick={() => setNewMood(mood.emoji)}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span
              className={`mt-1 text-sm font-semibold ${
                newMood === mood.emoji ? "text-white" : "text-gray-800"
              }`}
            >
              {mood.label}
            </span>
          </button>
        ))}
      </div>

      <textarea
        className="w-full h-32 p-4 bg-gray-200 rounded-xl mb-6 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 resize-none"
        placeholder="Add a note about your mood..."
        value={newMoodNote}
        onChange={(e) => setNewMoodNote(e.target.value)}
      />
      <button
        className={`w-full h-12 text-white font-bold rounded-xl shadow-lg transition duration-200 transform ${
          !newMood
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.01]"
        }`}
        onClick={() => onSave(newMood, newMoodNote)}
        disabled={!newMood}
      >
        Save Mood
      </button>
    </div>
  );
};
