import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { productService } from "../services/api";

function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product;
  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          sku: product.sku,
          price: product.price,
          quantity: product.quantity,
        }
      : { name: "", sku: "", price: "", quantity: "" },
  );
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.sku || form.price === "" || form.quantity === "") {
      toast.error("All fields are required");
      return;
    }
    const data = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    };
    setLoading(true);
    try {
      if (isEdit) {
        await productService.update(product.id, data);
        toast.success("Product updated");
      } else {
        await productService.create(data);
        toast.success("Product created");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <h2>{isEdit ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Mouse"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>SKU / Code</label>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                placeholder="e.g. WM-001"
              />
            </div>
            <div className="form-group">
              <label>Price ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Quantity in Stock</label>
            <input
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving…" : isEdit ? "Update" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | product obj

  const load = () => {
    setLoading(true);
    productService
      .getAll()
      .then(setProducts)
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      await productService.delete(p.id);
      toast.success("Product deleted");
      load();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="page">
      {(modal === "add" || (modal && typeof modal === "object")) && (
        <ProductModal
          product={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => {
            setModal(null);
            load();
          }}
        />
      )}

      <div className="page-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">
            {products.length} products in inventory
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("add")}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading products…</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
          <p>No products yet. Add your first product!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--text3)" }}>{p.id}</td>
                  <td className="td-main">{p.name}</td>
                  <td>
                    <span className="mono">{p.sku}</span>
                  </td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${p.quantity === 0 ? "badge-red" : p.quantity <= 10 ? "badge-yellow" : "badge-green"}`}
                    >
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setModal(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
