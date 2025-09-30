import { useEffect, useMemo, useState } from "react";
import { fetchStockMovements } from "../../../api/inventory";

const PRIMARY_LOCATION = {
  id: 1,
  name: "Central Market Flagship",
};

const typeStyles = {
  PURCHASE: "badge bg-success-subtle text-success",
  RECEIVE: "badge bg-success-subtle text-success",
  RETURN: "badge bg-success-subtle text-success",
  SALE: "badge bg-danger-subtle text-danger",
  TRANSFER: "badge bg-info-subtle text-info",
  ADJUSTMENT: "badge bg-secondary-subtle text-secondary",
};

const formatChange = (value) => {
  if (value === null || value === undefined) return "-";
  return value > 0 ? "+" + value : value.toString();
};

const formatDateTime = (value) => {
  if (!value) return "-";
  return value.replace("T", " ").replace("Z", "");
};

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadMovements = async () => {
      try {
        setLoading(true);
        const data = await fetchStockMovements({
          signal: controller.signal,
          locationId: PRIMARY_LOCATION.id,
        });
        setMovements(Array.isArray(data) ? data : []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError.message || "Unable to load stock movements");
        setMovements([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovements();
    return () => controller.abort();
  }, []);

  const filteredMovements = useMemo(() => {
    if (!search.trim()) return movements;
    const term = search.trim().toLowerCase();
    return movements.filter((movement) => {
      return [
        movement.productName,
        movement.reference,
        movement.movementType,
        movement.locationName,
      ]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(term));
    });
  }, [movements, search]);

  const renderRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7} className="text-center text-secondary py-4">
            Loading stock movements...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={7} className="text-center text-danger py-4">
            {error}
          </td>
        </tr>
      );
    }

    if (!filteredMovements.length) {
      return (
        <tr>
          <td colSpan={7} className="text-center text-secondary py-4">
            No stock movement recorded for {PRIMARY_LOCATION.name}.
          </td>
        </tr>
      );
    }

    return filteredMovements.map((movement) => {
      const badgeClass = typeStyles[movement.movementType] ?? "badge bg-light text-dark";
      const quantityClass = movement.quantityChange < 0 ? "text-danger" : "text-success";
      return (
        <tr key={movement.movementId ?? movement.reference}>
          <td>{movement.movementId ?? "-"}</td>
          <td>{movement.productName ?? "-"}</td>
          <td>
            <span className={badgeClass}>{movement.movementType ?? "-"}</span>
          </td>
          <td className={quantityClass}>{formatChange(movement.quantityChange)}</td>
          <td>{movement.reference ?? "-"}</td>
          <td>{movement.note ?? "-"}</td>
          <td>{formatDateTime(movement.createdAt)}</td>
        </tr>
      );
    });
  };

  return (
    <div className="page">
      <h2 className="mb-3">Stock Movements</h2>
      <div className="text-secondary font-12 mb-3">
        History of inventory changes captured for {PRIMARY_LOCATION.name}. Each sale, receipt, or adjustment updates this log and the running stock level.
      </div>

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <label className="form-label text-secondary small" htmlFor="movement-search">
            Quick filter
          </label>
          <input
            id="movement-search"
            type="search"
            className="form-control"
            placeholder="Search product, reference, or movement type"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Movement ID</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity Change</th>
                <th>Reference</th>
                <th>Note</th>
                <th>Logged At</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockMovements;
