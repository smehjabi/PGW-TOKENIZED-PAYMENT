import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader/Loader";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // Fetch both backend and frontend carts
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          "http://localhost:3000/api/cart/get-user-cart",
          { headers }
        );
        const backendCart = res.data.data || [];

        const frontendCart = JSON.parse(localStorage.getItem("cart") || "[]");

        // Normalize IDs (_id or id) and merge carts
        const normalize = (item) => ({ ...item, cartId: item._id || item.id });
        const mergedCart = [
          ...backendCart.map(normalize),
          ...frontendCart.map(normalize),
        ];

        // Deduplicate items by cartId (backend items preferred)
        const uniqueCart = [];
        const seenIds = new Set();
        for (const item of mergedCart) {
          if (!seenIds.has(item.cartId)) {
            uniqueCart.push(item);
            seenIds.add(item.cartId);
          }
        }

        setCartItems(uniqueCart);
      } catch (err) {
        console.error("Error fetching backend cart:", err);
        const frontendCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartItems(frontendCart.map((item) => ({ ...item, cartId: item._id || item.id })));
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Remove item (from backend or frontend)
  const handleRemoveItem = async (cartId) => {
    const item = cartItems.find((i) => i.cartId === cartId);
    if (!item) return;

    // Remove from backend if _id exists
    if (item._id) {
      try {
        await axios.delete(
          `http://localhost:3000/api/cart/remove-from-cart/${item._id}`,
          { headers }
        );
      } catch (err) {
        console.error("Backend remove error:", err);
      }
    }

    // Remove from frontend cart
    const updatedCart = cartItems.filter((i) => i.cartId !== cartId);
    localStorage.setItem(
      "cart",
      JSON.stringify(updatedCart.filter((i) => !i._id)) // store only frontend items
    );
    setCartItems(updatedCart);
  };

  // Total price
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-medium">
        <Loader /> Loading your cart...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 pt-24">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Your Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.cartId}
                className="flex items-center justify-between bg-white border rounded-xl shadow-md p-4"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={item.imageUrl || item.image || "https://via.placeholder.com/80"}
                    alt={item.name || "Item"}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{item.name || "Unknown"}</h2>
                    <p className="text-gray-600">৳ {item.price || 0}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.cartId)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 text-right">
            <h3 className="text-2xl font-semibold mb-3">Total: ৳ {totalPrice}</h3>
            <button
              onClick={() =>
                navigate("/payment", { state: { Cart: cartItems, Total: totalPrice } })
              }
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
