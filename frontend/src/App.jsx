import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Menu from "./pages/Menu";
import Cart from "./pages/Cart";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import OrderHistory from './pages/OrderHistory';
import ViewFood from "./pages/ViewFood";
import Chatbot from "./components/Chatbot/Chatbot";
// import Offers from "./pages/Offers";

const App = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 relative">
      <Navbar />

      <main className="grow px-6 py-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/order-history" element={<OrderHistory />} />
          <Route path="/view-food-details/:id" element={<ViewFood />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/search" element={<SearchResults />} />
          {/* <Route path="/offers" element={<Offers />} /> */}
        </Routes>
      </main>

      <Footer />

      {/* Chatbot floating at bottom-right */}
      <div className="fixed bottom-4 right-4 z-50">
        <Chatbot />
      </div>
    </div>
  );
};

export default App;
