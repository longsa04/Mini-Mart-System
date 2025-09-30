import { useEffect, useMemo, useState } from "react";
import { fetchStockLevels, fetchStockMovements } from "../../../api/inventory";

const PRIMARY_LOCATION = {
  id: 1,
  name: "Central Market Flagship",
};
const LOW_STOCK_THRESHOLD = 20;
const INBOUND_TYPES = new Set(["PURCHASE", "RECEIVE", "RETURN"]);

const formatDateTime = (value) => {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
};

const InventoryOverview = () => {
  const [stockLevels, setStockLevels] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadOverview = async () => {
      try {
        setLoading(true);
        const [stockData, movementData] = await Promise.all([
          fetchStockLevels({ signal: controller.signal, locationId: PRIMARY_LOCATION.id }),
          fetchStockMovements({ signal: controller.signal, locationId: PRIMARY_LOCATION.id }),
        ]);
        setStockLevels(Array.isArray(stockData) ? stockData : []);
        setMovements(Array.isArray(movementData) ? movementData : []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError.message || "Unable to load inventory overview");
        setStockLevels([]);
        setMovements([]);
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
    return () => controller.abort();
  }, []);

  const summary = useMemo(() => {
    if (!stockLevels.length) {
      return { skuCount: 0, totalUnits: 0, lowStockCount: 0 };
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

  const lowStockItems = useMemo(() => {
    return stockLevels
      .filter((row) => (row.quantity ?? 0) <= LOW_STOCK_THRESHOLD)
      .sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0))
      .slice(0, 5);
  }, [stockLevels]);

  const inboundMovements = useMemo(() => {
    return movements
      .filter((movement) => {
        const quantity = movement.quantityChange ?? 0;
        if (quantity <= 0) return false;
        if (!movement.movementType) return true;
        return INBOUND_TYPES.has(movement.movementType);
      })
      .sort((a, b) => {
        const aDate = a.createdAt ?? "";
        const bDate = b.createdAt ?? "";
        return bDate.localeCompare(aDate);
      })
      .slice(0, 5);
  }, [movements]);

  return (
    <div className="page">
      <h2 className="mb-3">Inventory Overview</h2>
      <p className="text-secondary font-12 mb-4">
        Single-store overview for {PRIMARY_LOCATION.name}. Monitor stock health, highlight low items, and confirm inbound deliveries before the next shift.
      </p>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase font-12 mb-1">Total SKUs</div>
              <div className="fs-3 fw-bold">{summary.skuCount}</div>
              <div className="text-secondary font-12">Tracked at {PRIMARY_LOCATION.name}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase font-12 mb-1">Units On Hand</div>
              <div className="fs-3 fw-bold">{summary.totalUnits}</div>
              <div className="text-secondary font-12">Ready for sale right now</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <div className="text-secondary text-uppercase font-12 mb-1">Low Stock Alerts</div>
              <div className="fs-3 fw-bold text-danger">{summary.lowStockCount}</div>
              <div className="text-secondary font-12">Items at or below {LOW_STOCK_THRESHOLD} units</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="fw-semibold">Critical Stock Items</div>
              <div className="text-secondary font-12">
                Focus first on the items closest to running out
              </div>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Product</th>
                    <th>On Hand</th>
                    <th>SKU</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center text-secondary py-4">
                        Checking stock levels...
                      </td>
                    </tr>
                  ) : lowStockItems.length ? (
                    lowStockItems.map((item, index) => (
                      <tr key={item.stockId ?? `critical-${index}`}>
                        <td>{item.productName ?? "-"}</td>
                        <td className="text-danger fw-semibold">{item.quantity ?? 0}</td>
                        <td>{item.sku ?? "-"}</td>
                        <td>{formatDateTime(item.lastUpdated)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center text-secondary py-4">
                        All items are above the safety threshold.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="fw-semibold">Inbound Stock</div>
              <div className="text-secondary font-12">
                Recent receipts and purchase movements arriving at {PRIMARY_LOCATION.name}
              </div>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Movement</th>
                    <th>Logged At</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary py-4">
                        Loading inbound activity...
                      </td>
                    </tr>
                  ) : inboundMovements.length ? (
                    inboundMovements.map((movement, index) => (
                      <tr key={movement.movementId ?? `inbound-${index}`}>
                        <td>{movement.reference ?? "-"}</td>
                        <td>{movement.productName ?? "-"}</td>
                        <td className="text-success">{movement.quantityChange ?? 0}</td>
                        <td>{movement.movementType ?? "-"}</td>
                        <td>{formatDateTime(movement.createdAt)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary py-4">
                        No inbound stock recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryOverview;

