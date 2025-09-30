import { useEffect, useMemo, useState } from "react";
import { fetchStockLevels, adjustStock } from "../../../api/inventory";
import { fetchProducts as fetchProductsApi } from "../../../api/products";

const PRIMARY_LOCATION = {
  id: 1,
  name: "Central Market Flagship",
};

const LOW_STOCK_THRESHOLD = 20;

const formatDateTime = (value) => {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
};

const StockLevels = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState(null);
  const [adjustFeedback, setAdjustFeedback] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [formValues, setFormValues] = useState({
    productId: "",
    quantity: "",
    action: "add",
    note: "",
  });

  const resolveStockLevels = async (signal) => {
    const scoped = await fetchStockLevels({
      signal,
      locationId: PRIMARY_LOCATION.id,
    });

    if (Array.isArray(scoped) && scoped.length > 0) {
      setUsedFallback(false);
      return scoped;
    }

    if (signal?.aborted) {
      return [];
    }

    const fallback = await fetchStockLevels({ signal });
    if (Array.isArray(fallback) && fallback.length > 0) {
      setUsedFallback(true);
      return fallback;
    }

    setUsedFallback(false);
    return Array.isArray(scoped) ? scoped : [];
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        const [stockData, productData] = await Promise.all([
          resolveStockLevels(controller.signal),
          fetchProductsApi({ signal: controller.signal }),
        ]);

        setStockLevels(Array.isArray(stockData) ? stockData : []);
        setProducts(Array.isArray(productData) ? productData : []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError.message || "Unable to load stock levels");
        setStockLevels([]);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, []);

  const summary = useMemo(() => {
    if (!stockLevels.length) {
      return { skuCount: 0, lowStockCount: 0, totalUnits: 0 };
    }

    const uniqueProducts = new Set();
    let totalUnits = 0;
    let lowStockCount = 0;

    stockLevels.forEach((row) => {
      const quantity = row.quantity ?? 0;
      totalUnits += quantity;
      if (quantity <= LOW_STOCK_THRESHOLD) {
        lowStockCount += 1;
      }

      if (row.productId != null) {
        uniqueProducts.add(row.productId);
      } else if (row.sku) {
        uniqueProducts.add(row.sku);
      } else if (row.productName) {
        uniqueProducts.add(row.productName);
      }
    });

    return {
      skuCount: uniqueProducts.size,
      totalUnits,
      lowStockCount,
    };
  }, [stockLevels]);

  const productOptions = useMemo(() => {
    if (products.length) {
      return products
        .map((product) => ({
          id: product.productId ?? product.id,
          name: product.name ?? "Unnamed product",
        }))
        .filter((option) => option.id != null);
    }

    return stockLevels
      .map((row) => ({
        id: row.productId,
        name: row.productName ?? row.sku ?? "Unnamed product",
      }))
      .filter((option) => option.id != null);
  }, [products, stockLevels]);

  const refreshStockLevels = async () => {
    try {
      setLoading(true);
      const updated = await resolveStockLevels();
      setStockLevels(Array.isArray(updated) ? updated : []);
      setError(null);
    } catch (refreshError) {
      setError(refreshError.message || "Unable to load stock levels");
      setStockLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustChange = (event) => {
    const { name, value } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAdjustSubmit = async (event) => {
    event.preventDefault();

    const quantityNumber = Number(formValues.quantity);
    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setAdjustError("Quantity must be greater than zero.");
      return;
    }

    const movementType = formValues.action === "remove" ? "SALE" : "RECEIVE";
    const payload = {
      productId: Number(formValues.productId),
      locationId: PRIMARY_LOCATION.id,
      quantity: quantityNumber,
      movementType,
      reference:
        formValues.action === "remove" ? "Manual shrink" : "Manual receive",
    };

    const trimmedNote = formValues.note.trim();
    if (trimmedNote) {
      payload.note = trimmedNote;
    }

    try {
      setAdjustError(null);
      setAdjustFeedback(null);
      setAdjusting(true);
      await adjustStock(payload);
      setAdjustFeedback(
        formValues.action === "remove"
          ? "Stock reduced successfully."
          : "Stock increased successfully."
      );
      setFormValues((previous) => ({
        ...previous,
        quantity: "",
        note: "",
      }));
      await refreshStockLevels();
    } catch (submitError) {
      setAdjustError(submitError.message || "Unable to adjust stock.");
    } finally {
      setAdjusting(false);
    }
  };

  const renderRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={4} className="text-center text-secondary py-4">
            Loading stock levels...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={4} className="text-center text-danger py-4">
            {error}
          </td>
        </tr>
      );
    }

    if (!stockLevels.length) {
      return (
        <tr>
          <td colSpan={4} className="text-center text-secondary py-4">
            No stock information for {PRIMARY_LOCATION.name}.
          </td>
        </tr>
      );
    }

    return stockLevels.map((row, index) => {
      const quantity = row.quantity ?? 0;
      const isLow = quantity <= LOW_STOCK_THRESHOLD;
      const keyParts = [
        row.stockId,
        row.productId,
        row.sku,
        row.productName,
      ].filter(Boolean);
      const rowKey = keyParts.join("-") || `stock-${index}`;
      const skuLine = row.sku ? `SKU: ${row.sku}` : null;

      return (
        <tr key={rowKey}>
          <td>
            <div className="fw-semibold">
              {row.productName ?? "Unnamed product"}
            </div>
            {skuLine && <div className="text-secondary small">{skuLine}</div>}
          </td>
          <td>{row.categoryName ?? "-"}</td>
          <td className={isLow ? "text-danger fw-semibold" : ""}>
            {quantity}
            {isLow ? (
              <span className="badge bg-danger-subtle text-danger ms-2">
                Low
              </span>
            ) : null}
          </td>
          <td>{formatDateTime(row.lastUpdated)}</td>
        </tr>
      );
    });
  };

  return (
    <div className="page">
      <h2 className="mb-3">Store Stock Levels</h2>
      <div className="text-secondary font-12 mb-4">
        Tracking on-hand quantities for {PRIMARY_LOCATION.name}. Movements from
        sales or receipts update this table automatically.
      </div>

      {usedFallback && !loading && !error && (
        <div className="alert alert-info">
          Showing stock across all locations because no entries exist for
          {" "}
          {PRIMARY_LOCATION.name}. Post a manual receive or complete a paid
          order to seed this location.
        </div>
      )}

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="h6 mb-2">Quick Stock Adjustment</h3>
          <div className="text-secondary font-12 mb-3">
            Increase or reduce quantities for the {PRIMARY_LOCATION.name} shelves
            before the cashier shift.
          </div>

          {adjustError && (
            <div className="alert alert-danger" role="alert">
              {adjustError}
            </div>
          )}

          {adjustFeedback && !adjustError && (
            <div className="alert alert-success" role="alert">
              {adjustFeedback}
            </div>
          )}

          <form className="row g-3 align-items-end" onSubmit={handleAdjustSubmit}>
            <div className="col-lg-4">
              <label className="form-label">Product</label>
              <select
                name="productId"
                className="form-select"
                value={formValues.productId}
                onChange={handleAdjustChange}
                disabled={adjusting || !productOptions.length}
                required
              >
                <option value="">Select a product</option>
                {productOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-sm-3 col-lg-2">
              <label className="form-label">Action</label>
              <select
                name="action"
                className="form-select"
                value={formValues.action}
                onChange={handleAdjustChange}
                disabled={adjusting}
              >
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
              </select>
            </div>

            <div className="col-sm-3 col-lg-2">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                className="form-control"
                name="quantity"
                value={formValues.quantity}
                onChange={handleAdjustChange}
                disabled={adjusting}
                required
              />
            </div>

            <div className="col-lg-4">
              <label className="form-label">Note (optional)</label>
              <input
                type="text"
                className="form-control"
                name="note"
                value={formValues.note}
                onChange={handleAdjustChange}
                disabled={adjusting}
                placeholder="e.g. Counted during opening"
              />
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={adjusting || !productOptions.length}
              >
                {adjusting ? "Saving..." : "Apply Adjustment"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={refreshStockLevels}
                disabled={adjusting || loading}
              >
                Refresh Table
              </button>
            </div>
          </form>

          {!productOptions.length && !loading && (
            <div className="alert alert-warning mt-3 mb-0" role="alert">
              Add products in the Product Catalog before adjusting stock levels.
            </div>
          )}
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase font-12 mb-1">
                Active SKUs
              </div>
              <div className="fs-3 fw-bold">{summary.skuCount}</div>
              <div className="text-secondary font-12">
                Available at {PRIMARY_LOCATION.name}
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase font-12 mb-1">
                Units On Hand
              </div>
              <div className="fs-3 fw-bold">{summary.totalUnits}</div>
              <div className="text-secondary font-12">Ready for sale today</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase font-12 mb-1">
                Low Stock Alerts
              </div>
              <div className="fs-3 fw-bold text-danger">
                {summary.lowStockCount}
              </div>
              <div className="text-secondary font-12">
                Items {"<="} {LOW_STOCK_THRESHOLD} units
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockLevels;
