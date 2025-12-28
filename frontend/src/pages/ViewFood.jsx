import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ViewFood = () => {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/food/foods/${id}`
        );
        setFood(response.data.data);
      } catch (error) {
        console.error("Error fetching food details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();
  }, [id]);

  if (loading) return <h3 className="text-xl font-semibold p-6">Loading food details...</h3>;
  if (!food) return <h3 className="text-xl font-semibold p-6">Food not found!</h3>;

  return (
    <div
      className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md"
      style={{ display: "flex", gap: "25px" }}
    >
      {/* Left Side Image */}
      <div style={{ flex: "1" }}>
        <img
          src={food.imageUrl}
          alt={food.name}
          style={{
            width: "100%",
            borderRadius: "10px",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Right Side Details */}
      <div style={{ flex: "1" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "10px" }}>
          {food.name}
        </h1>

        <p style={{ fontSize: "1.2rem", marginBottom: "10px" }}>
          <span style={{ fontWeight: "bold" }}>Price:</span> {food.price} TK
        </p>

        <p style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
          <span style={{ fontWeight: "bold" }}>Description:</span> {food.description}
        </p>

        <p style={{ fontSize: "1.1rem", marginBottom: "10px" }}>
          <span style={{ fontWeight: "bold" }}>Category:</span> {food.category}
        </p>

        <p style={{ fontSize: "1.1rem" }}>
          <span style={{ fontWeight: "bold" }}>Restaurant:</span> {food.restaurant}
        </p>
      </div>
    </div>
  );
};

export default ViewFood;
