import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaBars, FaTimes, FaShoppingCart } from "react-icons/fa";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn ?? false);
  const role = useSelector((state) => state.auth?.role ?? "user");

  // Updated links – includes Order History
  const links = [
    { title: "Home", link: "/" },
    { title: "Menu", link: "/menu" },
    { title: "Cart", link: "/cart" },
    { title: "Order History", link: "/order-history" },
    { title: "Admin", link: "/admin" },
  ];

  // Filter links based on login/role
  let filteredLinks = [...links];

  if (!isLoggedIn) {
    filteredLinks = filteredLinks.filter(
      (item) => !["Cart", "Admin", "Order History"].includes(item.title)
    );
  } else if (role === "user") {
    filteredLinks = filteredLinks.filter((item) => item.title !== "Admin");
  }

  // 🔍 Search Handler (Navigate to search results page)
  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) return;

    navigate(`/search?query=${searchTerm}`);
    setSearchTerm("");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://cdn-icons-png.flaticon.com/512/9425/9425742.png"
              alt="YumTrack Logo"
              className="h-10 w-10"
            />
            <h1 className="text-2xl font-extrabold text-red-600 tracking-tight">
              YumTrack
            </h1>
          </Link>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1 border border-gray-200 focus-within:ring-2 focus-within:ring-red-500 transition-all duration-300 w-80"
          >
            <FaSearch className="text-gray-500" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-gray-700 outline-none px-2 py-1 w-full"
            />
          </form>

          {/* Right side */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Cart */}
            {isLoggedIn && (
              <Link
                to="/cart"
                className="text-gray-700 hover:text-red-600 transition text-xl"
                title="Cart"
              >
                <FaShoppingCart />
              </Link>
            )}

            {/* Auth buttons */}
            {!isLoggedIn && (
              <div className="hidden md:flex gap-2">
                <Link
                  to="/login"
                  className="text-gray-700 border border-red-600 px-3 py-1 rounded-full text-sm md:text-base hover:bg-red-50 hover:text-red-700 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="bg-red-600 text-white px-3 py-1 rounded-full text-sm md:text-base font-medium hover:bg-red-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Menu Icon */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-2xl text-red-600 hover:text-red-700 transition"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </nav>

      {/* Side Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-2/3 sm:w-1/3 bg-white shadow-2xl z-40 transform transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start gap-6 px-6 py-8">
          <button
            onClick={() => setMenuOpen(false)}
            className="text-red-600 font-semibold self-end text-lg"
          >
            ✕
          </button>

          {filteredLinks.map((item, i) => (
            <Link
              key={i}
              to={item.link}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 text-lg font-medium hover:text-red-600 transition"
            >
              {item.title}
            </Link>
          ))}

          {/* Show login buttons if not logged in */}
          {!isLoggedIn && (
            <div className="flex flex-col w-full gap-3 mt-4">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-center border border-red-600 text-red-600 py-2 rounded-full font-semibold hover:bg-red-600 hover:text-white transition"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMenuOpen(false)}
                className="text-center bg-red-600 text-white py-2 rounded-full font-semibold hover:bg-red-700 transition"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
