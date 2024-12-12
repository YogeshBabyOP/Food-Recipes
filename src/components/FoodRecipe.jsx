import React, { useState } from "react";

function FoodRecipe() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // State to manage toggle button

  // Fetch recipes based on query
  const fetchRecipes = async () => {
    if (!query) return;

    setLoading(true);
    setError(null);
    setRecipes([]);

    const apiKey = "c6fd269315fa4d31bb2ac806f5484d63"; // Replace with your Spoonacular API Key
    const url = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${apiKey}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.results.length === 0) {
        // Handle no results
        setError("Ramya, no such food exists in this planet");
      } else {
        setRecipes(data.results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch full recipe details by ID
  const fetchRecipeDetails = async (id) => {
    setRecipeLoading(true);
    const apiKey = "c6fd269315fa4d31bb2ac806f5484d63"; // Replace with your Spoonacular API Key
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setSelectedRecipe(data);
      setModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setRecipeLoading(false);
    }
  };

  // Handle voice functionality with toggle
  const toggleVoice = (instructions) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel(); // Stop the speech
      setIsSpeaking(false);
    } else {
      const speech = new SpeechSynthesisUtterance(instructions);
      speech.lang = "en-US";
      speech.rate = 1;
      speech.volume = 1;
      window.speechSynthesis.speak(speech);
      setIsSpeaking(true);

      // Handle the end of speech
      speech.onend = () => setIsSpeaking(false);
    }
  };

  // Handle Enter key for searching
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchRecipes();
    }
  };

  return (
    <div
      className="min-h-screen p-4 flex flex-col items-center"
      style={{ backgroundColor: "#098080" }} // Updated Background Color
    >
      <h1 className="text-4xl font-bold text-white mb-8">
        what's on your fridge
      </h1>

      {/* Search Bar */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter a recipe name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress} // Handle Enter key
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
        />
        <button
          onClick={fetchRecipes}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Search
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && <p className="text-white">Loading recipes...</p>}

      {/* Error Message */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 w-full max-w-7xl">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {recipe.title}
              </h2>
              <button
                onClick={() => fetchRecipeDetails(recipe.id)}
                className="text-blue-500 hover:underline"
              >
                View Recipe
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full recipe details */}
      {modalOpen && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full overflow-auto max-h-[80vh]">
            {/* Loader while fetching recipe details */}
            {recipeLoading && (
              <div className="flex justify-center items-center space-x-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Fetching recipe details...</p>
              </div>
            )}

            {/* Recipe Content */}
            {/* Recipe Content */}
            {!recipeLoading && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  {selectedRecipe.title}
                </h2>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    window.speechSynthesis.cancel(); // Stop the voice when modal is closed
                    setIsSpeaking(false); // Ensure the isSpeaking state is reset
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4"
                >
                  Close
                </button>

                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Ingredients
                  </h3>
                  <ul className="list-disc pl-5">
                    {selectedRecipe.extendedIngredients.map((ingredient) => (
                      <li key={ingredient.id} className="text-gray-600">
                        {ingredient.original}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Instructions
                  </h3>
                  <div
                    className="text-gray-600 mb-4"
                    dangerouslySetInnerHTML={{
                      __html: selectedRecipe.instructions,
                    }}
                  />
                  <div className="flex gap-4">
                    <button
                      onClick={() => toggleVoice(selectedRecipe.instructions)}
                      className={`${
                        isSpeaking
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      } text-white px-4 py-2 rounded-lg`}
                    >
                      {isSpeaking ? "Stop Voice" : "Speak Instructions"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodRecipe;
