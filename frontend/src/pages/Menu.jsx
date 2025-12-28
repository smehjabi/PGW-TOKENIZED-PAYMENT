import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card/Card";
import Loader from "../components/Loader/Loader";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Common headers with auth info
  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ✅ Fetch all items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/item/get-all-items",
          { headers }
        );
        setItems(res.data.data || []);
      } catch (err) {
        console.error("Error fetching items:", err);
        alert("Failed to load menu items.");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // ✅ Add item to cart (fixed PUT request + correct header field)
  const handleAddToCart = async (itemId) => {
    try {
      await axios.put(
        "http://localhost:3000/api/cart/add-to-cart",
        {}, // backend doesn't need a body; reads from headers
        {
          headers: {
            ...headers,
            itemid: itemId, // backend reads itemid from header
          },
        }
      );
      alert("✅ Item added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("❌ Failed to add item to cart. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen px-8 py-6 pt-24">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">
          🍽️ All Available Foods
        </h1>
        <button
          onClick={() => navigate("/cart")}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg"
        >
          🛒 Go to Cart
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center my-8">
          <Loader />
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-500 text-center mt-8">No items found.</p>
      ) : (
        // ✅ Render Item Cards
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((food) => (
            <Card
              key={food._id}
              data={food}
              onAddToCart={() => handleAddToCart(food._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
