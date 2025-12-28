import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

const Card = ({ data, onAddToCart }) => {
  const handleAddClick = (e) => {
    e.preventDefault();
    onAddToCart && onAddToCart(data); // Send full item data
  };

  return (
    <div className="relative group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <Link to={`/view-food-details/${data._id}`}>
        <div className="overflow-hidden">
          <img
            src={data.imageUrl || "https://via.placeholder.com/400x300"}
            alt={data.name}
            className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-4 flex flex-col justify-between min-h-[140px]">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 group-hover:text-orange-600 transition-all duration-200">
            {data.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {data.description || "A delicious dish made with love."}
          </p>
        </div>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xl font-bold text-orange-600">
            ৳ {data.price}
          </span>

          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full font-medium shadow hover:bg-orange-600 transition-all duration-200"
          >
            <FaShoppingCart />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default Card;
