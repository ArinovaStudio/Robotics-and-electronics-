import React from "react";
import SingleProductPage from "../../../components/SingleProductPage";

// Dummy product data for demonstration
const dummyProduct = {
  name: "Aurdino uno 2.4",
  rating: 4.5,
  price: 260,
  oldPrice: 300,
  discount: 40,
  description:
    "This graphic t-shirt which is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.",
  images: [
    "/products/arduino-uno.png",
    "/products/arduino-mega.png",
    "/products/arduino-nano.png",
  ],
  variants: [
    {
      name: "Arduino Mega 2560",
      image: "/products/arduino-mega.png",
    },
    {
      name: "Arduino Mega 2560",
      image: "/products/arduino-mega-black.png",
    },
    {
      name: "Arduino Mega 2560",
      image: "/products/arduino-mega-blue.png",
    },
    {
      name: "Arduino Mega 2560",
      image: "/products/arduino-nano.png",
    },
  ],
};

const ProductPage = () => {
  return <SingleProductPage product={dummyProduct} />;
};

export default ProductPage;
