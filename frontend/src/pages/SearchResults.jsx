import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Card from "../components/Card/Card";
import Loader from "../components/Loader/Loader";

const SearchResults = () => {
  const query = new URLSearchParams(useLocation().search).get("query");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        // ✅ Call combined search endpoint
        const res = await axios.get(
          `http://localhost:3000/api/item/combined-search?query=${query}`
        );
        setItems(res.data.data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchSearchResults();
  }, [query]);

  if (loading) return <Loader />;

  if (!items.length)
    return (
      <p className="text-center mt-10 text-gray-500">
        No items found for "{query}"
      </p>
    );

  return (
    <div className="pt-24 px-8 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Search results for: <span className="text-red-600">{query}</span>
      </h2>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card
            key={item._id}
            data={{
              name: item.name,
              imageUrl: item.imageUrl || "https://via.placeholder.com/200",
              price: item.price || 0,
              description: item.description || "",
              category: item.category || "",
            }}
            onAddToCart={() => {
              const userId = localStorage.getItem("id");
              const token = localStorage.getItem("token");

              axios
                .put(
                  "http://localhost:3000/api/cart/add-to-cart",
                  {},
                  {
                    headers: {
                      authorization: `Bearer ${token}`,
                      itemid: item._id,
                      id: userId,
                    },
                  }
                )
                .then(() => alert("✅ Item added to cart!"))
                .catch(() => alert("❌ Failed to add item."));
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
