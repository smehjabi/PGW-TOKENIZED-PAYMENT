import { useState } from "react";
import axios from "axios";

export default function Checkout() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [agreementIdTemp, setAgreementIdTemp] = useState(null);
  const [savedAgreement, setSavedAgreement] = useState(null); // Active agreement
  const [amount] = useState("500"); // Example amount
  const { Cart, Total } = location.state || { Cart: [], Total: 0 };

  alert(Total);
  // ------------------------
  // Pay Without Agreement
  // ------------------------
  const payWithoutAgreement = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/bkash-payment/create", {
        amount,
        merchantInvoiceNumber: "INV-" + Date.now(),
      });
      // window.location.href = res.data.bkashURL;
    } catch (err) {
      console.error(err);
      alert("❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Create Agreement (OTP page)
  // ------------------------
  const createAgreement = async () => {
    if (!phone) return alert("Enter bKash number");

    try {
      setLoading(true);
      const res = await axios.post("/api/bkash/agreement/create", { phone, Total});

      const agreementId = res.data.agreementID || res.data.agreementId;
      if (!agreementId) return alert("❌ Agreement creation failed");

      setAgreementIdTemp(agreementId);
      window.open(res.data.bkashURL, "_blank"); // OTP approval
      alert("✅ OTP sent! Approve in your bKash app.");
    } catch (err) {
      console.error(err);
      alert("❌ Agreement creation failed");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Execute Agreement (after OTP)
  // ------------------------
  const executeAgreement = async () => {
    if (!agreementIdTemp) return alert("No agreement to execute");

    try {
      setLoading(true);
      const res = await axios.post("/api/bkash/agreement/execute", { agreementId: agreementIdTemp });

      if (!res.data?.agreementID || !res.data?.payerReference) {
        console.error(res.data);
        return alert("❌ Agreement execution failed. OTP may not be approved yet.");
      }

      alert("✅ Agreement executed successfully!");
      setSavedAgreement({
        agreementId: res.data.agreementId,
        walletNumber: res.data.payerAccount,
      });
      // setAgreementIdTemp(null);
      // if (!agreementIdTemp) return alert("No saved agreement");

    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("❌ Agreement execution failed. Approve OTP first.");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // Pay With Saved Agreement
  // ------------------------
  const payWithSavedAgreement = async () => {
    if (!savedAgreement) return alert("No saved agreement");

    try {
      setLoading(true);
      const res = await axios.post("/api/bkash/payment/create", {
        agreementId: savedAgreement.agreementId,
        payerReference: savedAgreement.walletNumber,
        amount,
        merchantInvoiceNumber: "INV-" + Date.now(),
      });
      window.location.href = res.data.bkashURL;
    } catch (err) {
      console.error(err);
      alert("❌ Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto", textAlign: "center" }}>
      <h2>Checkout</h2>

      <button onClick={payWithoutAgreement} disabled={loading}>
        Pay with bKash (Without Agreement)
      </button>

      <hr />

      {savedAgreement ? (
        <button onClick={payWithSavedAgreement} disabled={loading}>
          Pay with Saved bKash ****{savedAgreement.walletNumber.slice(-4)}
        </button>
      ) : (
        <>
          <input
            type="text"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button onClick={createAgreement} disabled={loading}>
            Create Agreement (OTP required)
          </button>

          {agreementIdTemp && (
            <button onClick={executeAgreement} disabled={loading} style={{ marginTop: 10 }}>
              Execute Agreement
            </button>
          )}
        </>
      )}
    </div>
  );
}
