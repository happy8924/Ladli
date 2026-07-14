import React, { useEffect, useState } from 'react';
import api from '../api/api';
import ProductCard from '../components/ProductCard';

const Search = () => {

    const [products, setProducts] = useState([]);

    const [filtered, setFiltered] = useState([]);

    const [query, setQuery] = useState('');

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const res = await api.get('/products/');

                setProducts(res.data);

                setFiltered(res.data);

            } catch (err) {

                console.error(err);

            }
        };

        fetchProducts();

    }, []);

    useEffect(() => {

        const result = products.filter(product =>
            product.name.toLowerCase().includes(query.toLowerCase())
        );

        setFiltered(result);

    }, [query, products]);

    return (

        <div className="container search-page">

            {/* TITLE */}
            <h1 className="search-title">
                Search Collection
            </h1>

            {/* SEARCH + FILTER */}
            <div className="search-top">

                <div className="search-box">

                    <input
                        type="text"
                        placeholder="Search Chaniya Choli..."
                        className="search-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />

                </div>

                {/* FILTERS */}
                <div className="filter-row">

                    <select className="filter-select">
                        <option>Category</option>
                        <option>Bridal</option>
                        <option>Navratri</option>
                        <option>Wedding</option>
                    </select>

                    <select className="filter-select">
                        <option>Fabric</option>
                        <option>Silk</option>
                        <option>Cotton</option>
                        <option>Georgette</option>
                    </select>

                    <select className="filter-select">
                        <option>Price</option>
                        <option>₹1000 - ₹3000</option>
                        <option>₹3000 - ₹5000</option>
                        <option>₹5000+</option>
                    </select>

                </div>

            </div>

            {/* PRODUCTS */}
            <div className="product-grid">

                {filtered.length > 0 ? (

                    filtered.map(product => (

                        <ProductCard
                            key={product.id}
                            product={product}
                        />

                    ))

                ) : (

                    <p className="no-products">
                        No products found.
                    </p>

                )}

            </div>

            {/* CSS */}
            <style>{`

                .search-page {

                    min-height: 100vh;

                    padding: 4rem 0;

                    background:
                    linear-gradient(
                        135deg,
                        #fff7f5 0%,
                        #fdf4ff 50%,
                        #fff1f2 100%
                    );
                }

                /* TITLE */

                .search-title {

                    font-size: 3rem;

                    text-align: center;

                    margin-bottom: 3rem;

                    font-family: 'Playfair Display', serif;

                    color: #581c87;
                }

                /* SEARCH */

                .search-top {

                    margin-bottom: 3rem;
                }

                .search-box {

                    margin-bottom: 1.5rem;
                }

                .search-input {

                    width: 100%;

                    padding: 18px 24px;

                    border-radius: 18px;

                    border: 2px solid #e9d5ff;

                    background: rgba(255,255,255,0.8);

                    backdrop-filter: blur(10px);

                    font-size: 1rem;

                    outline: none;

                    transition: 0.3s;
                }

                .search-input:focus {

                    border-color: #9333ea;

                    box-shadow:
                    0 0 0 4px rgba(147,51,234,0.1);
                }

                /* FILTERS */

                .filter-row {

                    display: flex;

                    gap: 1rem;

                    flex-wrap: wrap;
                }

                .filter-select {

                    padding: 14px 20px;

                    border-radius: 12px;

                    border: 1px solid #e5e7eb;

                    background: white;

                    font-weight: 600;

                    cursor: pointer;

                    transition: 0.3s;
                }

                .filter-select:hover {

                    border-color: #9333ea;
                }

                /* PRODUCTS */

                .product-grid {

                    display: grid;

                    grid-template-columns:
                    repeat(auto-fit, minmax(280px, 1fr));

                    gap: 2rem;
                }

                /* CARD */

                .boutique-card {

                    background: rgba(255,255,255,0.75);

                    backdrop-filter: blur(14px);

                    border-radius: 24px;

                    overflow: hidden;

                    border: 1px solid rgba(255,255,255,0.4);

                    transition: 0.4s;

                    box-shadow:
                    0 10px 30px rgba(0,0,0,0.05);
                }

                .boutique-card:hover {

                    transform: translateY(-10px);

                    box-shadow:
                    0 20px 50px rgba(147,51,234,0.15);
                }

                /* EMPTY */

                .no-products {

                    font-size: 1.1rem;

                    color: #6b7280;

                    margin-top: 2rem;
                }

                /* RESPONSIVE */

                @media (max-width: 768px) {

                    .search-title {

                        font-size: 2rem;
                    }

                    .filter-row {

                        flex-direction: column;
                    }

                    .filter-select {

                        width: 100%;
                    }
                }

            `}</style>

        </div>
    );
};

export default Search;