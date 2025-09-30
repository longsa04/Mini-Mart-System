import { useEffect, useMemo, useState } from "react";
import { fetchSuppliers } from "../../../api/suppliers";
import { fetchLocations } from "../../../api/locations";
import { fetchProducts } from "../../../api/products";
import {
  createPurchaseOrder,
  fetchPurchaseOrders,
} from "../../../api/purchaseOrders";

const todayISO = () => new Date().toISOString().slice(0, 10);

const blankLine = {
  productId: "",
  quantity: "",
  price: "",
};

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [form, setForm] = useState({
    supplierId: "",
    locationId: "",
    orderDate: todayISO(),
  });
  const [lines, setLines] = useState([{ ...blankLine }]);

  const defaultLocationId = useMemo(() => {
    const first = (Array.isArray(locations) ? locations : []).find(
      (location) => location?.locationId != null || location?.id != null
    );
    if (!first) {
      return "";
    }
    const id = first.locationId ?? first.id;
    return id != null ? String(id) : "";
  }, [locations]);


  const loadLookups = async (signal) => {
    const [supplierData, locationData, productData] = await Promise.all([
      fetchSuppliers({ signal }).catch(() => []),
      fetchLocations({ signal }).catch(() => []),
      fetchProducts({ signal }).catch(() => []),
    ]);

    if (signal?.aborted) return;
    setSuppliers(supplierData ?? []);
    setLocations(locationData ?? []);
    setProducts(productData ?? []);
  };

  const loadOrders = async ({ signal, start, end } = {}) => {
    setError(null);
    try {
      const data = await fetchPurchaseOrders({ start, end, signal });
      if (signal?.aborted) return;
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load purchase orders.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    Promise.all([loadLookups(controller.signal), loadOrders({ signal: controller.signal })])
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!form.locationId && defaultLocationId) {
      setForm((prev) => ({
        ...prev,
        locationId: defaultLocationId,
      }));
    }
  }, [defaultLocationId, form.locationId]);


  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 2500);
    return () => clearTimeout(timer);
  }, [success]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLineChange = (index, field, value) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, { ...blankLine }]);
  };

  const removeLine = (index) => {
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const resetForm = () => {
    setForm({
      supplierId: "",
      locationId: defaultLocationId,
      orderDate: todayISO(),
    });
    setLines([{ ...blankLine }]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.supplierId) {
      setError("Select a supplier to create a purchase order.");
      return;
    }

    if (!form.locationId) {
      setError("Select a destination branch for this purchase order.");
      return;
    }

    const orderLines = lines
      .map((line) => ({
        productId: line.productId ? Number(line.productId) : null,
        quantity: Number(line.quantity),
        price: Number(line.price),
      }))
      .filter((line) =>
        line.productId &&
        Number.isFinite(line.quantity) &&
        line.quantity > 0 &&
        Number.isFinite(line.price) &&
        line.price >= 0
      );

    if (orderLines.length === 0) {
      setError("Add at least one product line with quantity and price.");
      return;
    }

    const total = orderLines.reduce(
      (sum, line) => sum + line.quantity * line.price,
      0
    );

    const payload = {
      supplierId: Number(form.supplierId),
      locationId: form.locationId ? Number(form.locationId) : null,
      total,
      orderDate: form.orderDate ? new Date(form.orderDate).toISOString() : new Date().toISOString(),
      details: orderLines,
    };

    setSubmitting(true);
    try {
      await createPurchaseOrder(payload);
      setSuccess("Purchase order created.");
      await loadOrders({
        start: filterStart || undefined,
        end: filterEnd || undefined,
      });
      resetForm();
    } catch (err) {
      setError(err.message || "Unable to create purchase order.");
    } finally {
      setSubmitting(false);
    }
  };

  const applyFilter = async () => {
    const controller = new AbortController();
    setLoading(true);
    loadOrders({
      signal: controller.signal,
      start: filterStart || undefined,
      end: filterEnd || undefined,
    }).finally(() => {
      setLoading(false);
    });
  };

  const supplierOptions = useMemo(
    () =>
      (suppliers ?? []).map((supplier) => ({
        id: supplier?.supplierId,
        name: supplier?.name ?? `Supplier ${supplier?.supplierId ?? ""}`,
      })),
    [suppliers]
  );

  const locationOptions = useMemo(
    () =>
      (locations ?? []).map((location) => ({
        id: location?.locationId,
        name: location?.name ?? `Location ${location?.locationId ?? ""}`,
      })),
    [locations]
  );

  const productOptions = useMemo(
    () =>
      (products ?? []).map((product) => ({
        id: product?.productId,
        name: product?.name ?? `Product ${product?.productId ?? ""}`,
      })),
    [products]
  );

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Purchase Orders</h2>
          <p className="text-secondary font-12 mb-0">
            Record incoming stock orders and track supplier deliveries.
          </p>
        </div>
        <div className="d-flex gap-2">
          <input
            type="date"
            className="form-control form-control-sm"
            value={filterStart}
            onChange={(event) => setFilterStart(event.target.value)}
          />
          <input
            type="date"
            className="form-control form-control-sm"
            value={filterEnd}
            onChange={(event) => setFilterEnd(event.target.value)}
          />
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={applyFilter}>
            Filter
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <span className="fw-semibold">Create purchase order</span>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Supplier</label>
              <select
                name="supplierId"
                className="form-select"
                value={form.supplierId}
                onChange={handleFormChange}
                required
              >
                <option value="">Select supplier</option>
                {supplierOptions.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <select
                name="locationId"
                className="form-select"
                value={form.locationId}
                onChange={handleFormChange}
                required
              >
                <option value="">Select branch</option>
                {locationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Order date</label>
              <input
                type="date"
                name="orderDate"
                className="form-control"
                value={form.orderDate}
                onChange={handleFormChange}
              />
            </div>

            <div className="col-12">
              <div className="table-responsive border rounded">
                <table className="table table-sm table-borderless align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "35%" }}>Product</th>
                      <th style={{ width: "20%" }}>Quantity</th>
                      <th style={{ width: "20%" }}>Cost/unit</th>
                      <th style={{ width: "20%" }}>Line total</th>
                      <th style={{ width: "5%" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => {
                      const quantity = Number(line.quantity) || 0;
                      const price = Number(line.price) || 0;
                      const lineTotal = quantity * price;
                      return (
                        <tr key={index}>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={line.productId}
                              onChange={(event) =>
                                handleLineChange(index, "productId", event.target.value)
                              }
                            >
                              <option value="">Select product</option>
                              {productOptions.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              min={1}
                              className="form-control form-control-sm"
                              value={line.quantity}
                              onChange={(event) =>
                                handleLineChange(index, "quantity", event.target.value)
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="form-control form-control-sm"
                              value={line.price}
                              onChange={(event) =>
                                handleLineChange(index, "price", event.target.value)
                              }
                            />
                          </td>
                          <td>{lineTotal ? `$${lineTotal.toFixed(2)}` : "-"}</td>
                          <td className="text-end">
                            {lines.length > 1 && (
                              <button
                                type="button"
                                className="btn btn-link text-danger p-0"
                                onClick={() => removeLine(index)}
                              >
                                <i className="fa-solid fa-xmark"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm mt-2"
                onClick={addLine}
              >
                Add line
              </button>
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Create purchase order"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
                disabled={submitting}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>PO ID</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Total</th>
                  <th>Order date</th>
                  <th>Lines</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary py-4">
                      Loading purchase orders...
                    </td>
                  </tr>
                )}
                {!loading && orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary py-4">
                      No purchase orders recorded yet.
                    </td>
                  </tr>
                )}
                {orders.map((order) => (
                  <tr key={order.poId ?? order.purchaseOrderId ?? order.id}>
                    <td>{order.poId ?? order.purchaseOrderId ?? order.id ?? "-"}</td>
                    <td>{order?.supplier?.name ?? "-"}</td>
                    <td>{order?.location?.name ?? "All"}</td>
                    <td>
                      {order?.total != null
                        ? `$${Number(order.total).toFixed(2)}`
                        : "-"}
                    </td>
                    <td>
                      {order?.orderDate
                        ? new Date(order.orderDate).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {(order?.details ?? order?.purchaseOrderDetails ?? []).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;





