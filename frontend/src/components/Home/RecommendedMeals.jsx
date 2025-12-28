import React, { useEffect, useState } from "react";
import axios from "axios";

const RecommendedMeals = ({ handleOrderNow }) => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/RecommendedMeals/get-all");
        setMeals(res.data.data || []);
      } catch (err) {
        setError("Failed to load recommended meals");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading recommended meals...</p>;
  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;

  return (
    <div className="my-10">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Recommended Meals</h2>
      <div className="flex flex-wrap gap-4 justify-center">
        {meals.map((meal) => (
          meal && (
            <div
              key={meal._id}
              className="bg-white p-4 shadow rounded w-28 sm:w-36 md:w-48 text-center flex flex-col items-center"
            >
              <img
                src={meal.imageUrl || "https://via.placeholder.com/150"}
                alt={meal.name || "Meal"}
                className="mx-auto mb-2 rounded w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 object-cover"
              />
              <p className="text-sm sm:text-base font-medium">{meal.name || "Unknown"}</p>
              <p className="text-red-600 mt-1">৳ {meal.price || 0}</p>
              <button
                onClick={() => handleOrderNow(meal)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Order Now
              </button>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default RecommendedMeals;
