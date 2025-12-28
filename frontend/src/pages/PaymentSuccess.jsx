// import React, { useEffect, useState } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const PaymentSuccess = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const paymentId = searchParams.get('paymentID');

//   const [statusMessage, setStatusMessage] = useState('Processing your payment...');
//   const [loading, setLoading] = useState(true);
//   const [details, setDetails] = useState(null);

//   useEffect(() => {
//     const executePayment = async () => {
//       if (!paymentId) {
//         setStatusMessage('❌ No payment ID found.');
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await axios.post('http://localhost:3000/api/bkash/execute-payment', { paymentId });
//         console.log('Execute Payment Response:', res.data);
//         setDetails(res.data);

//         // ✅ Consider success if executed or already completed
//         const isSuccess =
//           res.data.transactionStatus === 'Completed' ||
//           res.data.message === 'Payment was already completed' ||
//           res.data.details?.internalCode === 'payment_already_completed' ||
//           res.data.details?.internalCode === 'ETC70052';

//         if (isSuccess) {
//           setStatusMessage('✅ Payment Successful!');
//           setTimeout(() => navigate('/profile/orderHistory'), 2500);
//         } else {
//           setStatusMessage(`❌ Payment Failed! Status: ${res.data.transactionStatus || 'Unknown'}`);
//           setTimeout(() => navigate('/cart'), 4000);
//         }
//       } catch (err) {
//         console.error('Execute Payment Error:', err.response?.data || err.message);
//         setStatusMessage('❌ Payment Failed! Please try again.');
//         setDetails(err.response?.data || err.message);
//         setTimeout(() => navigate('/cart'), 4000);
//       } finally {
//         setLoading(false);
//       }
//     };

//     executePayment();
//   }, [paymentId, navigate]);

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-600 px-4">
//       <h1 className="text-3xl font-semibold text-center">{statusMessage}</h1>

//       {loading && (
//         <p className="mt-4 text-gray-600 text-center">
//           Please wait while we confirm your transaction...
//         </p>
//       )}

//       {details && (
//         <div className="mt-6 w-full max-w-2xl">
//           <h2 className="text-xl font-semibold mb-2 text-red-700">Payment Details (Debug)</h2>
//           <pre className="p-4 bg-gray-100 rounded-lg text-gray-800 overflow-auto">
//             {JSON.stringify(details, null, 2)}
//           </pre>
//         </div>
//       )}

//       {!loading && statusMessage.includes('Failed') && (
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded"
//         >
//           Retry Payment
//         </button>
//       )}

//       {!loading && statusMessage.includes('Payment Successful') && (
//         <button
//           onClick={() => navigate('/profile/orderHistory')}
//           className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
//         >
//           View Orders
//         </button>
//       )}
//     </div>
//   );
// };

// export default PaymentSuccess;


// import React, { useEffect, useState } from 'react';
// import { useSearchParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const PaymentSuccess = () => {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();
//   const paymentId = searchParams.get('paymentID');

//   const [statusMessage, setStatusMessage] = useState('Processing your payment...');
//   const [loading, setLoading] = useState(true);
//   const [details, setDetails] = useState(null);

//   useEffect(() => {
//     const executePayment = async () => {
//       if (!paymentId) {
//         setStatusMessage('❌ No payment ID found.');
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await axios.post('http://localhost:3000/api/bkash/execute-payment', { paymentId });
//         console.log('Execute Payment Response:', res.data);
//         setDetails(res.data);

//         const isSuccess =
//           res.data.transactionStatus === 'Completed' ||
//           res.data.message === 'Payment was already completed' ||
//           res.data.details?.internalCode === 'payment_already_completed' ||
//           res.data.details?.internalCode === 'ETC70052';

//         if (isSuccess) {
//           setStatusMessage('✅ Payment Successful!');

//           // -------------------------------
//           // ⭐ PLACE ORDER AFTER PAYMENT SUCCESS
//           // -------------------------------
//           try {
//             await axios.post(
//               "http://localhost:3000/api/order/place-order",
//               {},
//               {
//                 headers: {
//                   id: localStorage.getItem("id"),
//                   authorization: `Bearer ${localStorage.getItem("token")}`,
//                 },
//               }
//             );

//             // -------------------------------
//             // ⭐ CLEAR CART AFTER ORDER SUCCESS
//             // -------------------------------
//             await axios.delete("http://localhost:3000/api/cart/clear-cart", {
//               headers: {
//                 id: localStorage.getItem("id"),
//                 authorization: `Bearer ${localStorage.getItem("token")}`,
//               },
//             });

//             console.log("Cart cleared successfully!");
//           } catch (err) {
//             console.error("Order/Cart Error:", err.response?.data || err.message);
//           }

//           setTimeout(() => navigate('/profile/orderHistory'), 2500);
//         } else {
//           setStatusMessage(`❌ Payment Failed! Status: ${res.data.transactionStatus || 'Unknown'}`);
//           setTimeout(() => navigate('/cart'), 4000);
//         }
//       } catch (err) {
//         console.error('Execute Payment Error:', err.response?.data || err.message);
//         setStatusMessage('❌ Payment Failed! Please try again.');
//         setDetails(err.response?.data || err.message);
//         setTimeout(() => navigate('/cart'), 4000);
//       } finally {
//         setLoading(false);
//       }
//     };

//     executePayment();
//   }, [paymentId, navigate]);

//   return (
//     <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-600 px-4">
//       <h1 className="text-3xl font-semibold text-center">{statusMessage}</h1>

//       {loading && (
//         <p className="mt-4 text-gray-600 text-center">
//           Please wait while we confirm your transaction...
//         </p>
//       )}

//       {details && (
//         <div className="mt-6 w-full max-w-2xl">
//           <h2 className="text-xl font-semibold mb-2 text-red-700">Payment Details (Debug)</h2>
//           <pre className="p-4 bg-gray-100 rounded-lg text-gray-800 overflow-auto">
//             {JSON.stringify(details, null, 2)}
//           </pre>
//         </div>
//       )}

//       {!loading && statusMessage.includes('Failed') && (
//         <button
//           onClick={() => window.location.reload()}
//           className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded"
//         >
//           Retry Payment
//         </button>
//       )}

//       {!loading && statusMessage.includes('Payment Successful') && (
//         <button
//           onClick={() => navigate('/profile/orderHistory')}
//           className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
//         >
//           View Orders
//         </button>
//       )}
//     </div>
//   );
// };

// export default PaymentSuccess;




// againnnnnn////


import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('paymentID');

  const [statusMessage, setStatusMessage] = useState('Processing your payment...');
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const executePayment = async () => {
      if (!paymentId) {
        setStatusMessage('❌ No payment Ipayment_already_completedD found.');
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post('http://localhost:3000/api/bkash/execute-payment', { paymentId });
        console.log('Execute Payment Response:', res.data);
        setDetails(res.data);

        const isSuccess =
          res.data.transactionStatus === 'Completed' ||
          res.data.message === 'Payment was already completed' ||
          res.data.details?.internalCode === '' ||
          res.data.details?.internalCode === 'ETC70052';

        if (isSuccess) {
          setStatusMessage('✅ Payment and order completed successfully!');
          setTimeout(() => navigate('/profile/orderHistory'), 2500);
        } else {
          setStatusMessage(`❌ Payment Failed! Status: ${res.data.transactionStatus || 'Unknown'}`);
          setTimeout(() => navigate('/cart'), 4000);
        }
      } catch (err) {
        console.error('Execute Payment Error:', err.response?.data || err.message);
        setStatusMessage('❌ Payment Failed! Please try again.');
        setDetails(err.response?.data || err.message);
        setTimeout(() => navigate('/cart'), 4000);
      } finally {
        setLoading(false);
      }
    };

    executePayment();
  }, [paymentId, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-red-600 px-4">
      <h1 className="text-3xl font-semibold text-center">{statusMessage}</h1>

      {loading && (
        <p className="mt-4 text-gray-600 text-center">
          Please wait while we confirm your transaction...
        </p>
      )}

      {details && (
        <div className="mt-6 w-full max-w-2xl">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Payment Details (Debug)</h2>
          <pre className="p-4 bg-gray-100 rounded-lg text-gray-800 overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>
      )}

      {!loading && statusMessage.includes('Failed') && (
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded"
        >
          Retry Payment
        </button>
      )}

      {!loading && statusMessage.includes('Payment and order completed') && (
        <button
          onClick={() => navigate('/profile/orderHistory')}
          className="mt-6 bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded"
        >
          View Orders
        </button>
      )}
    </div>
  );
};

export default PaymentSuccess;
