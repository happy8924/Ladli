import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  Heart,
  ShoppingBag,
  Star
} from 'lucide-react';

import api from '../api/api';

import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetails = () => {

  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState('M');
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isInWishlist
  } = useWishlist();

  // FETCH PRODUCT
  useEffect(() => {

    const fetchProduct = async () => {

      try {

        // PRODUCT DETAILS
        const res = await api.get(`/products/${id}`);

        setProduct(res.data);

        // RELATED PRODUCTS
        const allProducts = await api.get('/products/');

        const filtered = allProducts.data.filter(
          item => item.id !== res.data.id
        );

        setRelatedProducts(filtered.slice(0, 4));

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);
      }
    };

    fetchProduct();

  }, [id]);

  // LOADING
  if (loading) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  // PRODUCT NOT FOUND
  if (!product) {
    return (
      <div className="loading">
        Product not found
      </div>
    );
  }

  // SIZES
  const sizes = product.sizes
    ? product.sizes.split(',')
    : ['S', 'M', 'L'];

  return (

    <div className="product-page">

      <div className="container">

        {/* PRODUCT SECTION */}
        <div className="product-layout">

          {/* PRODUCT IMAGE */}
          <div className="product-image-box">

            <img
              src={product.image_url}
              alt={product.name}
              className="product-image"
            />

          </div>

          {/* PRODUCT INFO */}
          <div className="product-info">

            <p className="fabric">
              {product.fabric || 'Designer Collection'}
            </p>

            <h1 className="product-title">
              {product.name}
            </h1>

            {/* RATING */}
            <div className="rating-row">

              <div className="stars">

                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill="gold"
                    color="gold"
                  />
                ))}

              </div>

              <span>5.0 Luxury Rating</span>

            </div>

            {/* PRICE */}
            <div className="price">
              ₹{product.price.toLocaleString()}
            </div>

            {/* DESCRIPTION */}
            <p className="description">

              {product.description ||
                'Premium handcrafted Chaniya Choli with luxury embroidery and elegant traditional finishing.'}

            </p>

            {/* SIZE SECTION */}
            <div className="size-section">

              <h3>Select Size</h3>

              <div className="sizes">

                {sizes.map((size) => (

                  <button
                    key={size}
                    className={`size-btn ${
                      selectedSize === size ? 'active' : ''
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>

                ))}

              </div>

            </div>

            {/* ACTION BUTTONS */}
            <div className="action-row">

              {/* ADD TO CART */}
              <button
                className="cart-btn"
                onClick={() =>
                  addToCart({
                    ...product,
                    selectedSize
                  })
                }
              >

                <ShoppingBag size={20} />

                Add To Cart

              </button>

              {/* WISHLIST */}
              <button
                className={`wish-btn ${
                  isInWishlist(product.id)
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  toggleWishlist(product)
                }
              >

                <Heart
                  size={22}
                  fill={
                    isInWishlist(product.id)
                      ? 'red'
                      : 'transparent'
                  }
                />

              </button>

            </div>

          </div>

        </div>

        {/* RELATED PRODUCTS */}
        <div className="related-section">

          <h2 className="related-title">
            You May Also Like
          </h2>

          <div className="related-grid">

            {relatedProducts.map((item) => (

              <div
                key={item.id}
                className="related-card"
              >

                <img
                  src={item.image_url}
                  alt={item.name}
                />

                <h3>{item.name}</h3>

                <p>
                  ₹{item.price.toLocaleString()}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* CSS */}
      <style>{`

        .product-page {
          min-height: 100vh;
          padding: 5rem 0;
          background:
            linear-gradient(
              135deg,
              #fff7f5 0%,
              #fdf4ff 100%
            );
        }

        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .product-image-box {
          background: white;
          padding: 2rem;
          border-radius: 30px;
          box-shadow:
            0 20px 50px rgba(0,0,0,0.08);
        }

        .product-image {
          width: 100%;
          border-radius: 20px;
        }

        .fabric {
          color: #9333ea;
          text-transform: uppercase;
          letter-spacing: 3px;
          font-size: 0.8rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .product-title {
          font-size: 3rem;
          line-height: 1.2;
          margin-bottom: 1rem;
          color: #111827;
          font-family: 'Playfair Display', serif;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stars {
          display: flex;
          gap: 4px;
        }

        .price {
          font-size: 2.5rem;
          font-weight: bold;
          color: #7e22ce;
          margin-bottom: 1.5rem;
        }

        .description {
          color: #6b7280;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .size-section h3 {
          margin-bottom: 1rem;
        }

        .sizes {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .size-btn {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          border: 2px solid #ddd;
          font-weight: bold;
          transition: 0.3s;
        }

        .size-btn.active {
          background: #7e22ce;
          color: white;
          border-color: #7e22ce;
        }

        .action-row {
          display: flex;
          gap: 1rem;
        }

        .cart-btn {
          flex: 1;
          background: #7e22ce;
          color: white;
          padding: 18px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: bold;
          transition: 0.3s;
        }

        .cart-btn:hover {
          background: #6b21a8;
        }

        .wish-btn {
          width: 60px;
          border-radius: 16px;
          background: white;
          border: 1px solid #eee;
          transition: 0.3s;
        }

        .wish-btn.active {
          background: #fee2e2;
        }

        .loading {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }

        /* RELATED PRODUCTS */

        .related-section {
          margin-top: 6rem;
        }

        .related-title {
          font-size: 2rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #581c87;
          font-family: 'Playfair Display', serif;
        }

        .related-grid {
          display: grid;
          grid-template-columns:
            repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .related-card {
          background: white;
          padding: 1rem;
          border-radius: 20px;
          transition: 0.3s;
          box-shadow:
            0 10px 30px rgba(0,0,0,0.06);
        }

        .related-card:hover {
          transform: translateY(-8px);
        }

        .related-card img {
          width: 100%;
          border-radius: 16px;
          margin-bottom: 1rem;
        }

        .related-card h3 {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 900px) {

          .product-layout {
            grid-template-columns: 1fr;
          }

          .product-title {
            font-size: 2rem;
          }

        }

      `}</style>

    </div>
  );
};

export default ProductDetails;