import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { Cart, Total } = location.state || { Cart: [], Total: 0 };

  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    address: '',
    phone: '',
  });

  // -------------------------------
  // ✅ Common headers
  // -------------------------------
  const headers = {
    id: localStorage.getItem('id'),
    authorization: `Bearer ${localStorage.getItem('token')}`,
  };

  // -------------------------------
  // 🧾 Handle Place Order
  // -------------------------------
  const handlePlaceOrder = async () => {
    if (!paymentMethod || !customerDetails.name || !customerDetails.address || !customerDetails.phone) {
      alert('⚠️ Please fill in all fields and select a payment method!');
      return;
    }

    if (paymentMethod === 'Cash on Delivery') {
      try {
        const response = await axios.post(
          'http://localhost:3000/api/order/place-order',
          { order: Cart, paymentMethod, customerDetails },
          { headers }
        );
        alert(response.data.message || '✅ Order placed successfully!');
        navigate('/profile/orderHistory');
      } catch (error) {
        console.error('Error placing order:', error);
        alert('❌ Failed to place order');
      }
    } else if (paymentMethod === 'Bkash') {
      try {
        const response = await axios.post(
          'http://localhost:3000/api/order/place-order',
          { order: Cart, paymentMethod, customerDetails },
          { headers }
        );
        alert(response.data.message || 'Redirecting to bKash');
        handleBkashPayment(); // Call bKash flow
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to connect with bKash');
      }
    }
  };

  // -------------------------------
  // 💳 Handle bKash Payment Flow
  // -------------------------------
  const handleBkashPayment = async () => {
    if (!headers.id || !headers.authorization) {
      alert('❌ User not logged in. Please login first.');
      return;
    }

    try {
      setLoading(true);

      // Step 1️⃣: Refresh token
      await axios.post('http://localhost:3000/api/bkash/grant-token', {}, { headers });

      // Step 2️⃣: Create payment
      const createRes = await axios.post(
        'http://localhost:3000/api/bkash/create-payment',
        {
          amount: Total.toFixed(2),
          callbackURL: 'http://localhost:5173/payment-success',
          payerReference: customerDetails.phone,
          merchantInvoiceNumber: `INV-${Date.now()}`,
        },
        { headers }
      );

      console.log('bKash Create Payment Response:', createRes.data);

      // Step 3️⃣: Redirect to bKash Gateway
      if (createRes.data?.bkashURL) {
        // window.location.href = createRes.data.bkashURL;
        window.open(createRes.data.bkashURL, "_blank");
      } else if (createRes.data?.paymentID) {
        alert('Payment created but no redirect URL. Please check backend response.');
      } else {
        alert('Unexpected response from bKash. Check console for details.');
      }
    } catch (error) {
      console.error('bKash Payment Error:', error.response?.data || error.message);
      alert('❌ Failed to start bKash payment. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white px-12 py-8 min-h-screen">
      <h1 className="text-5xl text-red-600 font-semibold mb-8">Payment Page</h1>

      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        {/* Payment Method */}
        <h2 className="text-2xl font-semibold text-red-700 mb-4">Payment Method</h2>

        <div className="mb-4">
          <input
            type="radio"
            id="bkash"
            name="payment"
            value="Bkash"
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="accent-red-600"
          />
          <label htmlFor="bkash" className="ml-2 text-red-700">bKash</label>
        </div>

        <div className="mb-4">
          <input
            type="radio"
            id="cashOnDelivery"
            name="payment"
            value="Cash on Delivery"
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="accent-red-600"
          />
          <label htmlFor="cashOnDelivery" className="ml-2 text-red-700">Cash on Delivery</label>
        </div>

        {/* Customer Info */}
        <h2 className="text-2xl font-semibold text-red-700 mb-4">Customer Details</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full mb-4 p-2 rounded border border-red-200 bg-white text-red-700"
          value={customerDetails.name}
          onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Address"
          className="w-full mb-4 p-2 rounded border border-red-200 bg-white text-red-700"
          value={customerDetails.address}
          onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone Number"
          className="w-full mb-4 p-2 rounded border border-red-200 bg-white text-red-700"
          value={customerDetails.phone}
          onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
        />

        {/* Summary */}
        <h2 className="text-2xl font-semibold text-red-700 mb-4">Order Summary</h2>
        <p className="text-red-800">Total Items: {Cart.length}</p>
        <p className="text-red-800">Total Amount: {Total.toFixed(2)} BDT</p>

        {/* Confirm Button */}
        <button
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded mt-4 w-full"
          onClick={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? 'Processing Payment...' : 'Confirm Order'}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
