import React, { useState, useEffect } from "react";
import { dashboardService } from "../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardService
      .getStats()
      .then(setStats)
      .catch(() => setError("Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="page">
        <div className="loading">Loading dashboard…</div>
      </div>
    );
  if (error)
    return (
      <div className="page">
        <div className="error-banner">{error}</div>
      </div>
    );

  const statCards = [
    {
      label: "Total Products",
      value: stats.total_products,
      icon: "📦",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
    },
    {
      label: "Total Customers",
      value: stats.total_customers,
      icon: "👥",
      color: "#10b981",
      bg: "rgba(16,185,129,0.1)",
    },
    {
      label: "Total Orders",
      value: stats.total_orders,
      icon: "🛒",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      label: "Low Stock Items",
      value: stats.low_stock_products.length,
      icon: "⚠️",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.1)",
    },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">Overview of your inventory system</p>
        </div>
      </div>

      <div className="stat-grid">
        {statCards.map((s) => (
          <div className="stat-card" key={s.label}>
            <div
              className="stat-icon"
              style={{ background: s.bg, color: s.color }}
            >
              {s.icon}
            </div>
            <div className="stat-info">
              <p>{s.label}</p>
              <h3 style={{ color: s.color }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {stats.low_stock_products.length > 0 && (
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">⚠️ Low Stock Products</h3>
            <span className="badge badge-yellow">
              {stats.low_stock_products.length} items
            </span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((p) => (
                  <tr key={p.id}>
                    <td className="td-main">{p.name}</td>
                    <td>
                      <span className="mono">{p.sku}</span>
                    </td>
                    <td>${p.price.toFixed(2)}</td>
                    <td>
                      <span
                        className={`badge ${p.quantity === 0 ? "badge-red" : "badge-yellow"}`}
                      >
                        {p.quantity} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stats.low_stock_products.length === 0 && (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
          <p style={{ color: "var(--green)", fontWeight: 600 }}>
            All products are well stocked!
          </p>
          <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>
            No items below the low stock threshold.
          </p>
        </div>
      )}
    </div>
  );
}
