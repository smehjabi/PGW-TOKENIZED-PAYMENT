import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Processing your payment...");

  // useEffect(() => {
  //   const payWithSavedAgreement = async () => {
  //     try {
  //       // Extract query params from URL
  //       const params = new URLSearchParams(location.search);
  //       const agreementId = params.get("agreementId");
  //       const trxId = params.get("trxId");
  //       const total = params.get("total");

  //       if (trxId) {
  //         setMessage(`✅ Payment Successful, bKash Transaction ID: ${trxId}`);
  //         setLoading(false);
  //         return;
  //       }

  //       if (!agreementId) {
  //         setMessage("❌ Agreement ID missing in the callback URL");
  //         setLoading(false);
  //         return;
  //       }

  //       // Call your backend to execute payment with agreement
  //       const res = await axios.post("http://localhost:3000/api/bkash/payment/create", {
  //           agreementId: agreementId,
  //           payerReference: "adasda",
  //           amount: total,
  //           merchantInvoiceNumber: "INV-" + Date.now(),
  //         });
  //         console.log(res.data);
  //       if (res.data?.transactionStatus === "Initiated" && res.data?.bkashURL) {
  //         window.open(res.data.bkashURL, "_self");
  //       } else {
  //         setMessage("❌ Payment Creation Failed: " + res.data?.message || "Unknown error");
  //       }
  //     } catch (err) {
  //       console.error(err.response?.data || err.message);
  //       setMessage("❌ Payment Inoitiation Failed");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   payWithSavedAgreement();
  // }, [location.search, navigate]);


  // useEffect(() => {
  //   const payWithOutAgreement = async () => {
  //     try {
  //       // Extract query params from URL
  //       const params = new URLSearchParams(location.search);
  //       const paymentID = params.get("paymentID");
  //       // const wotrxId = params.get("wotrxId");

  //       // if (wotrxId) {
  //       //   setMessage(`✅ Payment Successful, bKash Transaction ID: ${wotrxId}`);
  //       //   setLoading(false);
  //       //   return;
  //       // }

  //       if (!paymentID) {
  //         setMessage("❌ Payment ID missing in the callback URL");
  //         setLoading(false);
  //         return;
  //       }

  //       // Call your backend to execute payment with agreement
  //       const res = await axios.post("http://localhost:3000/api/bkash/execute-payment", {
  //           paymentId: paymentID,
  //         });
  //         console.log(res.data);
  //       if (res.data?.transactionStatus === "Completed" && res.data?.trxId) {
  //        setMessage(`✅ Payment Successful, bKash Transaction ID: ${res.data.trxId}`);
  //        setLoading(false);
  //       } else {
  //         setMessage("❌ Payment Creation Failed: " + res.data?.message || "Unknown error");
  //         setLoading(false);
  //       }
  //     } catch (err) {
  //       console.error(err.response?.data || err.message);
  //       setMessage("❌ Payment Inoitiation Failed");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   payWithOutAgreement();
  // }, [location.search, navigate]);

  useEffect(() => {
  const handlePaymentCallback = async () => {
    try {
      const params = new URLSearchParams(location.search);

      const agreementId = params.get("agreementId");
      const paymentID = params.get("paymentID");
      const trxId = params.get("trxId");
      const total = params.get("total");

      // 1️⃣ If trxId exists → payment already successful
      if (trxId) {
        setMessage(`✅ Payment Successful, bKash Transaction ID: ${trxId}`);
        setLoading(false);
        return;
      }

      // 2️⃣ Agreement-based payment flow
      if (agreementId) {
        const res = await axios.post(
          "http://localhost:3000/api/bkash/payment/create",
          {
            agreementId,
            payerReference: "adasda",
            amount: total,
            merchantInvoiceNumber: "INV-" + Date.now(),
          }
        );

        if (res.data?.transactionStatus === "Initiated" && res.data?.bkashURL) {
          window.open(res.data.bkashURL, "_self");
          return;
        }

        setMessage("❌ Payment Creation Failed");
        setLoading(false);
        return;
      }

      // 3️⃣ Non-agreement payment flow
      if (paymentID) {
        const res = await axios.post(
          "http://localhost:3000/api/bkash/execute-payment",
          { paymentId: paymentID }
        );

        if (res.data?.transactionStatus === "Completed") {
          setMessage(`✅ Payment Successful, bKash Transaction ID: ${res.data.originalResponse.trxId}`);
        } else {
          setMessage("❌ Payment Execution Failed");
        }

        setLoading(false);
        return;
      }

      // 4️⃣ Nothing matched
      setMessage("❌ Invalid payment callback");
      setLoading(false);

    } catch (err) {
      console.error(err.response?.data || err.message);
      setMessage("❌ Payment Processing Failed");
      setLoading(false);
    }
  };

  handlePaymentCallback();
}, [location.search]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading ? (
        <p className="text-lg font-semibold">{message}</p>
      ) : (
        <p className={`text-lg font-semibold ${message.includes("❌") ? "text-red-500" : "text-green-500"}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default PaymentSuccess;
