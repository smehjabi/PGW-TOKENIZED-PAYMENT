import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const headers = {
          id: localStorage.getItem("id"),
          authorization: `Bearer ${localStorage.getItem("token")}`,
        };

        const res = await axios.get(
          "http://localhost:3000/api/order/get-order-history",
          { headers }
        );

        // Sort latest first
        const sortedOrders = (res.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setOrders(sortedOrders);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p className="text-center mt-8">Loading orders...</p>;

  return (
  <div className="px-8 py-6 min-h-screen bg-gray-50 pt-24">

      <h1 className="text-3xl font-semibold mb-6 text-red-600">
        🧾 Your Order History
      </h1>

      {orders.length === 0 ? (
        <p className="text-gray-700">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <p><strong>Item:</strong> {order.item?.name || "N/A"}</p>
              <p><strong>Amount:</strong> {order.item?.price || "N/A"} BDT</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod || "N/A"}</p>
              <p><strong>Status:</strong> {order.paymentStatus || "N/A"}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
