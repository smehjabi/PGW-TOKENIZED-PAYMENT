// import React from "react";

// const FeaturedFoods = () => {
//   const foods = [
//     {
//       id: 1,
//       name: "Grilled Chicken Salad",
//       image: "Grilled Chicken Salad2.jpeg",
//       desc: "Fresh greens topped with grilled chicken and vinaigrette.",
//     },
//     {
//       id: 2,
//       name: "Cheesy Pizza",
//       image: "Cheesy Pizza.jpeg",
//       desc: "Loaded with mozzarella and fresh basil.",
//     },
//     {
//       id: 3,
//       name: "Pasta Alfredo",
//       image: "Pasta Alfredo.jpeg",
//       desc: "Creamy Alfredo pasta with herbs and parmesan.",
//     },
//   ];

//   return (
//     <div className="my-10">
//       <h2 className="text-2xl font-bold mb-6 text-gray-800">Featured Foods</h2>
//       <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-6">
//         {foods.map((food) => (
//           <div
//             key={food.id}
//             className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300"
//           >
//             <img
//               src={food.image}
//               alt={food.name}
//               className="w-full h-48 object-cover rounded-t-2xl"
//             />
//             <div className="p-4">
//               <h3 className="text-lg font-semibold text-gray-900">
//                 {food.name}
//               </h3>
//               <p className="text-gray-600 text-sm mt-2">{food.desc}</p>
//               <button className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition">
//                 Order Now
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default FeaturedFoods;

import React from "react";

const FeaturedFoods = () => {
  // Replace your hardcoded foods with REAL ObjectIds from database
  const foods = [
    {
      _id: "6749811df2f3dd93283c21b7",
      name: "Grilled Chicken Salad",
      image: "Grilled Chicken Salad2.jpeg",
      desc: "Fresh greens topped with grilled chicken and vinaigrette.",
    },
    {
      _id: "6749811df2f3dd93283c21ba",
      name: "Cheesy Pizza",
      image: "Cheesy Pizza.jpeg",
      desc: "Loaded with mozzarella and fresh basil.",
    },
    {
      _id: "6749811df2f3dd93283c21be",
      name: "Pasta Alfredo",
      image: "Pasta Alfredo.jpeg",
      desc: "Creamy Alfredo pasta with herbs and parmesan.",
    },
  ];

  // Headers for auth
  const headers = {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

const handleAddToCart = async (itemId) => {
  try {
    const userId = localStorage.getItem("id");

    const response = await fetch("http://localhost:3000/api/cart/add-to-cart", {
      method: "PUT",
      headers: {
        authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemid: itemId,   // FIXED (lowercase)
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to add item");
    }

    alert("✅ Item added to cart!");
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert("❌ Failed to add item to cart.");
  }
};
  return (
    <div className="my-10 px-8 pt-24">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-left flex items-center gap-2">
        🍽️ Featured Foods
      </h2>

      <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
        {foods.map((food) => (
          <div
            key={food._id}
            className="bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300"
          >
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-48 object-cover rounded-t-2xl"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{food.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{food.desc}</p>
              <button
                onClick={() => handleAddToCart(food._id)}
                className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
              >
                Order Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedFoods;
