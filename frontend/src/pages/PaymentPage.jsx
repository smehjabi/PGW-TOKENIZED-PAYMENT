// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import axios from "axios";

// const PaymentPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { Cart, Total } = location.state || { Cart: [], Total: 0 };

//   const isLoggedIn = Boolean(localStorage.getItem("token"));

//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [bkashType, setBkashType] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [customerDetails, setCustomerDetails] = useState({
//     name: "",
//     address: "",
//     phone: "",
//   });

//   const [pendingAgreement, setPendingAgreement] = useState(null);

//   const headers = {
//     id: localStorage.getItem("id"),
//     authorization: `Bearer ${localStorage.getItem("token")}`,
//   };

//   // ========================
//   // PLACE ORDER
//   // ========================
//   const handlePlaceOrder = async () => {
//     if (!paymentMethod) return alert("Select payment method");
//     if (!customerDetails.name || !customerDetails.address || !customerDetails.phone)
//       return alert("Fill all customer details");

//     if (paymentMethod === "COD") return placeOrderCOD();

//     if (paymentMethod === "BKASH") {
//       if (!bkashType) return alert("Select bKash option");
//       if (bkashType === "NO_AGREEMENT") return handleBkashWithoutAgreement();
//       if (bkashType === "AGREEMENT") return handleBkashWithAgreement();
//     }
//   };

//   // // ========================
//   // // COD
//   // // ========================
//   // const placeOrderCOD = async () => {
//   //   try {
//   //     setLoading(true);
//   //     const res = await axios.post(
//   //       "http://localhost:3000/api/order/place-order",
//   //       { order: Cart, paymentMethod: "COD", customerDetails },
//   //       { headers }
//   //     );
//   //     alert(res.data.message || "Order placed successfully");
//   //     navigate("/profile/orderHistory");
//   //   } catch (err) {
//   //     alert("Failed to place COD order");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// // -------------------------------
//   // 🧾 Handle Place Order
//   // -------------------------------
//   const handlePlaceOrder = async () => {
//     if (!paymentMethod || !customerDetails.name || !customerDetails.address || !customerDetails.phone) {
//       alert('⚠️ Please fill in all fields and select a payment method!');
//       return;
//     }

//     if (paymentMethod === 'Cash on Delivery') {
//       try {
//         const response = await axios.post(
//           'http://localhost:3000/api/order/place-order',
//           { order: Cart, paymentMethod, customerDetails },
//           { headers }
//         );
//         alert(response.data.message || '✅ Order placed successfully!');
//         navigate('/profile/orderHistory');
//       } catch (error) {
//         console.error('Error placing order:', error);
//         alert('❌ Failed to place order');
//       }
//     } else if (paymentMethod === 'Bkash') {
//       try {
//         const response = await axios.post(
//           'http://localhost:3000/api/order/place-order',
//           { order: Cart, paymentMethod, customerDetails },
//           { headers }
//         );
//         alert(response.data.message || 'Redirecting to bKash');
//         handleBkashPayment(); // Call bKash flow
//       } catch (error) {
//         console.error('Error placing order:', error);
//         alert('Failed to connect with bKash');
//       }
//     }
//   };

//   // ========================
//   // BKASH WITHOUT AGREEMENT
//   // ========================
//   // const handleBkashWithoutAgreement = async () => {
//   //   try {
//   //     setLoading(true);

//   //     await axios.post("http://localhost:3000/api/bkash/grant-token");

//   //     const res = await axios.post("http://localhost:3000/api/bkash-payment/create", {
//   //       amount: Total.toFixed(2),
//   //       payerReference: customerDetails.phone,
//   //       merchantInvoiceNumber: `INV-${Date.now()}`,
//   //     });

//   //     if (res.data?.bkashURL) {
//   //       window.open(res.data.bkashURL, "_blank");
//   //     } else {
//   //       alert("Failed to start payment");
//   //     }
//   //   } catch (err) {
//   //     alert("bKash payment failed");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleBkashPayment = async () => {
//     if (!headers.id || !headers.authorization) {
//       alert('❌ User not logged in. Please login first.');
//       return;
//     }

//     try {
//       setLoading(true);

//       // Step 1️⃣: Refresh token
//       await axios.post('http://localhost:3000/api/bkash/grant-token', {}, { headers });

//       // Step 2️⃣: Create payment
//       const createRes = await axios.post(
//         'http://localhost:3000/api/bkash/create-payment',
//         {
//           amount: Total.toFixed(2),
//           callbackURL: 'http://localhost:5173/payment-success',
//           payerReference: customerDetails.phone,
//           merchantInvoiceNumber: `INV-${Date.now()}`,
//         },
//         { headers }
//       );

//       console.log('bKash Create Payment Response:', createRes.data);

//       // Step 3️⃣: Redirect to bKash Gateway
//       if (createRes.data?.bkashURL) {
//         // window.location.href = createRes.data.bkashURL;
//         window.open(createRes.data.bkashURL, "_blank");
//       } else if (createRes.data?.paymentID) {
//         alert('Payment created but no redirect URL. Please check backend response.');
//       } else {
//         alert('Unexpected response from bKash. Check console for details.');
//       }
//     } catch (error) {
//       console.error('bKash Payment Error:', error.response?.data || error.message);
//       alert('❌ Failed to start bKash payment. Check console.');
//     } finally {
//       setLoading(false);
//     }
//   };


//   // ========================
//   // BKASH WITH AGREEMENT (OTP STEP)
//   // ========================
//   const handleBkashWithAgreement = async () => {
//     try {
//       setLoading(true);

//       await axios.post("http://localhost:3000/api/bkash/grant-token");

//       const agreementRes = await axios.post(
//         "http://localhost:3000/api/bkash/agreement/create",
//         {
//           amount: Total.toFixed(2),
//           phone: customerDetails.phone,
//           username: customerDetails.name,
//         }
//       );

//       if (!agreementRes.data?.bkashURL || !agreementRes.data?.agreementId) {
//         alert("Agreement creation failed");
//         return;
//       }

//       setPendingAgreement({
//         agreementId: agreementRes.data.agreementId,
//       });

//       window.open(agreementRes.data.bkashURL, "_blank");
//       // alert("OTP sent! Approve in bKash app then click Confirm Payment");

//     } catch (err) {
//       alert("Agreement failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ========================
//   // CONFIRM PAYMENT (AFTER OTP)
//   // ========================
//   const handleConfirmPayment = async () => {
//     if (!pendingAgreement) {
//       alert("No pending agreement");
//       return;
//     }

//     try {
//       setLoading(true);

//       const paymentRes = await axios.post(
//         "http://localhost:3000/api/bkash/payment/create",
//         {
//           agreementId: pendingAgreement.agreementId,
//           payerReference: customerDetails.phone, // ✅ MUST BE WALLET NUMBER
//           amount: Total.toFixed(2),
//           merchantInvoiceNumber: `INV-${Date.now()}`,
//         }
//       );

//       if (!paymentRes.data?.bkashURL) {
//         alert("Payment creation failed");
//         return;
//       }

//       window.open(paymentRes.data.bkashURL, "_blank");
//       setPendingAgreement(null);
//     } catch (err) {
//       alert("Payment failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ========================
//   // UI
//   // ========================
//   return (
//     <div className="bg-white px-12 py-8 min-h-screen">
//       <h1 className="text-4xl font-bold text-red-600 mb-8">Checkout</h1>

//       <div className="bg-red-50 p-6 rounded-lg border border-red-200">
//         <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>

//         <div>
//           <input type="radio" name="payment" onChange={() => { setPaymentMethod("COD"); setBkashType(""); }} />
//           <label className="ml-2">Cash on Delivery</label>
//         </div>

//         <div className="mt-2">
//           <input type="radio" name="payment" onChange={() => { setPaymentMethod("BKASH"); setBkashType(""); }} />
//           <label className="ml-2">bKash</label>
//         </div>

//         {paymentMethod === "BKASH" && (
//           <div className="ml-6 mt-4 bg-white p-4 rounded border">
//             <div>
//               <input type="radio" name="bkashType" onChange={() => setBkashType("NO_AGREEMENT")} />
//               <label className="ml-2">Without Agreement</label>
//             </div>

//             {isLoggedIn && (
//               <div className="mt-2">
//                 <input type="radio" name="bkashType" onChange={() => setBkashType("AGREEMENT")} />
//                 <label className="ml-2">With Agreement</label>
//               </div>
//             )}
//           </div>
//         )}

//         <h2 className="text-2xl font-semibold mt-6 mb-4">Customer Info</h2>

//         <input className="w-full mb-2 p-2 border" placeholder="Name"
//           value={customerDetails.name}
//           onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
//         />

//         <input className="w-full mb-2 p-2 border" placeholder="Address"
//           value={customerDetails.address}
//           onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
//         />

//         <input className="w-full mb-4 p-2 border" placeholder="Phone"
//           value={customerDetails.phone}
//           onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
//         />

//         <p>Total Items: {Cart.length}</p>
//         <p>Total Amount: ৳ {Total.toFixed(2)}</p>

//         <button onClick={handlePlaceOrder} disabled={loading}
//           className="mt-4 w-full bg-red-600 text-white p-3 rounded">
//           {loading ? "Processing..." : "Confirm Order"}
//         </button>

//         {/* {pendingAgreement && (
//           <button onClick={handleConfirmPayment} disabled={loading}
//             className="mt-4 w-full bg-green-600 text-white p-3 rounded">
//             Confirm Payment After OTP
//           </button>
//         )} */}
//       </div>
//     </div>
//   );
// };

// export default PaymentPage;
//==================================================================================================
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { Cart = [], Total = 0 } = location.state || {};

  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const [paymentMethod, setPaymentMethod] = useState("");
  const [bkashType, setBkashType] = useState("");
  const [loading, setLoading] = useState(false);

  const [customerDetails, setCustomerDetails] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const [pendingAgreement, setPendingAgreement] = useState(null);

  const headers = {
    id: localStorage.getItem("id"),
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  // ========================
  // PLACE ORDER HANDLER
  // ========================
  const handlePlaceOrder = async () => {
    if (!paymentMethod) return alert("Select payment method");
    if (!customerDetails.name || !customerDetails.address || !customerDetails.phone)
      return alert("Fill all customer details");

    if (paymentMethod === "COD") return placeOrderCOD();

    if (paymentMethod === "BKASH") {
      if (!bkashType) return alert("Select bKash option");

      if (bkashType === "NO_AGREEMENT") return handleBkashWithoutAgreement();
      if (bkashType === "AGREEMENT") return handleBkashWithAgreement();
    }
  };

  // ========================
  // COD ORDER
  // ========================
  const placeOrderCOD = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3000/api/order/place-order",
        { order: Cart, paymentMethod: "COD", customerDetails },
        { headers }
      );
      alert(res.data.message || "Order placed successfully");
      navigate("/profile/orderHistory");
    } catch {
      alert("Failed to place COD order");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // BKASH WITHOUT AGREEMENT
  // ========================
  const handleBkashWithoutAgreement = async () => {
    try {
      setLoading(true);

      // Grant token
      await axios.post("http://localhost:3000/api/bkash/grant-token", {}, { headers });

      const res = await axios.post(
        "http://localhost:3000/api/bkash/create-payment",
        {
          amount: Total.toFixed(2),
          payerReference: customerDetails.phone,
          merchantInvoiceNumber: `INV-${Date.now()}`,
        },
        { headers }
      );

      if (res.data?.bkashURL) {
        window.location.href = res.data.bkashURL;
      } else {
        alert("Failed to start bKash payment");
      }
    } catch (err) {
      console.error(err);
      alert("bKash payment failed");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // BKASH WITH AGREEMENT (OTP)
  // ========================
  const handleBkashWithAgreement = async () => {
    try {
      setLoading(true);

      await axios.post("http://localhost:3000/api/bkash/grant-token", {}, { headers });

      const agreementRes = await axios.post(
        "http://localhost:3000/api/bkash/agreement/create",
        {
          phone: customerDetails.phone,
          amount: Total.toFixed(2),
        },
        { headers }
      );

      if (!agreementRes.data?.bkashURL || !agreementRes.data?.agreementId) {
        alert("Agreement creation failed");
        return;
      }

      setPendingAgreement({ agreementId: agreementRes.data.agreementId });
      window.location.href = agreementRes.data.bkashURL;
    } catch (err) {
      console.error(err);
      alert("Agreement process failed");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // CONFIRM PAYMENT AFTER OTP
  // ========================
  const handleConfirmPayment = async () => {
    if (!pendingAgreement) return alert("No pending agreement");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:3000/api/bkash/payment/create",
        {
          agreementId: pendingAgreement.agreementId,
          amount: Total.toFixed(2),
        },
        { headers }
      );

      if (!res.data?.bkashURL) {
        alert("Payment creation failed");
        return;
      }

      window.location.href = res.data.bkashURL;
      setPendingAgreement(null);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // UI
  // ========================
  return (
    <div className="bg-white px-12 py-8 min-h-screen">
      <h1 className="text-4xl font-bold text-red-600 mb-8">Checkout</h1>

      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>

        <div>
          <input type="radio" name="payment" onChange={() => { setPaymentMethod("COD"); setBkashType(""); }} />
          <label className="ml-2">Cash on Delivery</label>
        </div>

        <div className="mt-2">
          <input type="radio" name="payment" onChange={() => { setPaymentMethod("BKASH"); setBkashType(""); }} />
          <label className="ml-2">bKash</label>
        </div>

        {paymentMethod === "BKASH" && (
          <div className="ml-6 mt-4 bg-white p-4 rounded border">
            <div>
              <input type="radio" name="bkashType" onChange={() => setBkashType("NO_AGREEMENT")} />
              <label className="ml-2">Without Agreement</label>
            </div>

            {isLoggedIn && (
              <div className="mt-2">
                <input type="radio" name="bkashType" onChange={() => setBkashType("AGREEMENT")} />
                <label className="ml-2">With Agreement</label>
              </div>
            )}
          </div>
        )}

        <h2 className="text-2xl font-semibold mt-6 mb-4">Customer Info</h2>

        <input className="w-full mb-2 p-2 border" placeholder="Name"
          value={customerDetails.name}
          onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
        />

        <input className="w-full mb-2 p-2 border" placeholder="Address"
          value={customerDetails.address}
          onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
        />

        <input className="w-full mb-4 p-2 border" placeholder="Phone"
          value={customerDetails.phone}
          onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
        />

        <p>Total Items: {Cart.length}</p>
        <p>Total Amount: ৳ {Total.toFixed(2)}</p>

        <button onClick={handlePlaceOrder} disabled={loading}
          className="mt-4 w-full bg-red-600 text-white p-3 rounded">
          {loading ? "Processing..." : "Confirm Order"}
        </button>

        {pendingAgreement && (
          <button onClick={handleConfirmPayment} disabled={loading}
            className="mt-4 w-full bg-green-600 text-white p-3 rounded">
            Confirm Payment After OTP
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;

