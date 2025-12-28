import React, { useEffect, useState } from "react";
import axios from "axios";

const PopularDishes = ({ handleOrderNow }) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/PopularDishes/get-all");
        setDishes(res.data.data || []);
      } catch (err) {
        setError("Failed to load popular dishes");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading popular dishes...</p>;
  if (error) return <p className="text-center text-red-600 mt-6">{error}</p>;

  return (
    <div className="my-10">
      <h2 className="text-2xl font-bold mb-6 text-orange-600">Popular Dishes</h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {dishes.map((dish) => (
          dish && (
            <div
              key={dish._id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 w-64 flex flex-col items-center"
            >
              <img
                src={dish.imageUrl || "https://via.placeholder.com/200"}
                alt={dish.name || "Dish"}
                className="w-full h-40 object-cover rounded-t-2xl"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-gray-900">{dish.name || "Unknown"}</h3>
                {dish.rating && <p className="text-yellow-500 mt-2">⭐ {dish.rating}</p>}
                <p className="text-red-600 mt-1">৳ {dish.price || 0}</p>
                <button
                  onClick={() => handleOrderNow(dish)}
                  className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Order Now
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default PopularDishes;
