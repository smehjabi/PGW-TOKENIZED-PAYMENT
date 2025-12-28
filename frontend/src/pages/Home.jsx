import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Hero from "../components/Home/Hero";

const Home = () => {
  const navigate = useNavigate();

  const [popularDishes, setPopularDishes] = useState([]);
  const [recommendedMeals, setRecommendedMeals] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // Fetch Popular + Recommended
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dishesRes, mealsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/PopularDishes/get-all"),
          axios.get("http://localhost:3000/api/RecommendedMeals/get-all"),
        ]);
        setPopularDishes(dishesRes.data.data || []);
        setRecommendedMeals(mealsRes.data.data || []);
      } catch (err) {
        console.error("Error fetching home data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch Recent Orders
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/order/get-order-history",
          { headers }
        );
        const sortedOrders = (res.data.data || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((o) => o.item)
          .filter(Boolean);

        setRecentOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching recent orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchRecentOrders();
  }, []);

  // Handle Add to Cart
  const handleOrderNow = (item) => {
    if (!item) return;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    console.log(cart)
    const existingItem = cart.find((i) => i.id === item.id);

    console.log("ExItm:",existingItem);

    // if (existingItem) {
    //   existingItem.quantity += 1;
    // } else {
      cart.push({ ...item, quantity: 1 });
    // }
    console.log(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("✅ Item added to cart!");
    navigate("/cart");
  };

  if (loading) return <p className="text-center mt-10">Loading home data...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="bg-gray-50 text-gray-900 px-8 py-6">
      {/* Hero */}
      <Hero />

      {/* 1️⃣ Popular Dishes */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">
          Popular Dishes
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {popularDishes.map(
            (dish) =>
              dish && (
                <div
                  key={dish._id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
                >
                  <img
                    src={dish.imageUrl || "https://via.placeholder.com/200"}
                    alt={dish.name}
                    className="w-32 h-32 rounded-md object-cover mb-2"
                  />
                  <h3 className="text-lg font-semibold">{dish.name}</h3>
                  {dish.rating && (
                    <p className="text-yellow-500">⭐ {dish.rating}</p>
                  )}
                  <p className="text-red-600 mb-2">৳ {dish.price || 0}</p>

                  <button
                    onClick={() => handleOrderNow(dish)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Order Now
                  </button>
                </div>
              )
          )}
        </div>
      </section>

      {/* 2️⃣ Recently Ordered */}
      <section className="mt-10 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">
          Recently Ordered
        </h2>

        {loadingOrders ? (
          <p className="text-gray-500">Loading recent orders...</p>
        ) : recentOrders.length === 0 ? (
          <p className="text-gray-500">You have not ordered anything yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentOrders.map(
              (item) =>
                item && (
                  <div
                    key={item._id}
                    className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
                  >
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-32 h-32 rounded-md object-cover mb-2"
                    />
                    <h3 className="text-lg font-semibold">{item.name}</h3>
                    <p className="text-red-600 mb-2">৳ {item.price || 0}</p>

                    <button
                      onClick={() => handleOrderNow(item)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Order Now
                    </button>
                  </div>
                )
            )}
          </div>
        )}
      </section>

      {/* 3️⃣ Recommended Meals */}
      <section className="my-10">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">
          Recommended Meals
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {recommendedMeals.map(
            (meal) =>
              meal && (
                <div
                  key={meal._id}
                  className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center"
                >
                  <img
                    src={meal.imageUrl || "https://via.placeholder.com/150"}
                    alt={meal.name}
                    className="w-32 h-32 rounded-md object-cover mb-2"
                  />
                  <h3 className="text-lg font-semibold">{meal.name}</h3>
                  <p className="text-red-600 mb-2">৳ {meal.price || 0}</p>

                  <button
                    onClick={() => handleOrderNow(meal)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Order Now
                  </button>
                </div>
              )
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
