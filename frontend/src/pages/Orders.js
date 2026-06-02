import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { orderService, customerService, productService } from "../services/api";

function OrderModal({ onClose, onSave }) {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    customer_id: "",
    items: [{ product_id: "", quantity: 1 }],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([customerService.getAll(), productService.getAll()]).then(
      ([c, p]) => {
        setCustomers(c);
        setProducts(p);
      },
    );
  }, []);

  const updateItem = (idx, field, val) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: val };
    setForm({ ...form, items });
  };

  const addItem = () =>
    setForm({
      ...form,
      items: [...form.items, { product_id: "", quantity: 1 }],
    });
  const removeItem = (idx) =>
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_id) {
      toast.error("Select a customer");
      return;
    }
    if (form.items.some((i) => !i.product_id)) {
      toast.error("Select a product for each item");
      return;
    }
    const payload = {
      customer_id: parseInt(form.customer_id),
      items: form.items.map((i) => ({
        product_id: parseInt(i.product_id),
        quantity: parseInt(i.quantity),
      })),
    };
    setLoading(true);
    try {
      await orderService.create(payload);
      toast.success("Order created");
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to create order");
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
        <h2>Create Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer</label>
            <select
              value={form.customer_id}
              onChange={(e) =>
                setForm({ ...form, customer_id: e.target.value })
              }
            >
              <option value="">Select customer…</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} — {c.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Order Items</label>
            {form.items.map((item, idx) => (
              <div className="order-item-row" key={idx}>
                <select
                  value={item.product_id}
                  onChange={(e) =>
                    updateItem(idx, "product_id", e.target.value)
                  }
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (${p.price.toFixed(2)}) — {p.quantity} in stock
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                  placeholder="Qty"
                />
                {form.items.length > 1 && (
                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => removeItem(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-item-btn" onClick={addItem}>
              + Add another item
            </button>
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
              {loading ? "Creating…" : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" style={{ maxWidth: 560 }}>
        <h2>Order #{order.id}</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 4,
              }}
            >
              Customer
            </p>
            <p style={{ fontWeight: 600 }}>{order.customer?.full_name}</p>
            <p style={{ color: "var(--text3)", fontSize: 13 }}>
              {order.customer?.email}
            </p>
          </div>
          <div>
            <p
              style={{
                fontSize: 11,
                color: "var(--text3)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 4,
              }}
            >
              Order Date
            </p>
            <p style={{ fontWeight: 600 }}>
              {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: "var(--text3)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 10,
          }}
        >
          Items
        </p>
        <div className="table-wrap" style={{ marginBottom: 20 }}>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="td-main">
                    {item.product?.name || `Product #${item.product_id}`}
                  </td>
                  <td>{item.quantity}</td>
                  <td>${item.unit_price.toFixed(2)}</td>
                  <td>${(item.unit_price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--border)",
            paddingTop: 16,
          }}
        >
          <span style={{ color: "var(--text3)", fontWeight: 600 }}>
            Total Amount
          </span>
          <span
            style={{ fontSize: 20, fontWeight: 700, color: "var(--accent)" }}
          >
            ${order.total_amount.toFixed(2)}
          </span>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const load = () => {
    setLoading(true);
    orderService
      .getAll()
      .then(setOrders)
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleView = async (order) => {
    try {
      const full = await orderService.getById(order.id);
      setViewOrder(full);
    } catch {
      toast.error("Failed to load order details");
    }
  };

  const handleDelete = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}? Stock will be restored.`))
      return;
    try {
      await orderService.delete(o.id);
      toast.success("Order cancelled and stock restored");
      load();
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  return (
    <div className="page">
      {showCreate && (
        <OrderModal
          onClose={() => setShowCreate(false)}
          onSave={() => {
            setShowCreate(false);
            load();
          }}
        />
      )}
      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
        />
      )}

      <div className="page-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Order
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p>No orders yet. Create your first order!</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <span className="mono">#{o.id}</span>
                  </td>
                  <td className="td-main">
                    {o.customer?.full_name || `Customer #${o.customer_id}`}
                  </td>
                  <td>{o.items?.length ?? "—"}</td>
                  <td style={{ fontWeight: 600 }}>
                    ${o.total_amount.toFixed(2)}
                  </td>
                  <td>
                    <span className="badge badge-blue">{o.status}</span>
                  </td>
                  <td style={{ color: "var(--text3)" }}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleView(o)}
                      >
                        View
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(o)}
                      >
                        Cancel
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
