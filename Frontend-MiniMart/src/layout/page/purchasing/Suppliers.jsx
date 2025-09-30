import { useEffect, useState } from "react";
import {
  createSupplier,
  deleteSupplier,
  fetchSuppliers,
  updateSupplier,
} from "../../../api/suppliers";

const blankForm = {
  supplierId: null,
  name: "",
  phone: "",
  email: "",
  address: "",
};

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadSuppliers = async (signal) => {
    setError(null);
    try {
      const data = await fetchSuppliers({ signal });
      if (signal?.aborted) return;
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Unable to load suppliers.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    loadSuppliers(controller.signal).finally(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => setSuccess(null), 2500);
    return () => clearTimeout(timer);
  }, [success]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) {
      setError("Supplier name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      phone: form.phone ? form.phone.trim() : null,
      email: form.email ? form.email.trim() : null,
      address: form.address ? form.address.trim() : null,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateSupplier(editingId, payload);
        setSuccess("Supplier updated successfully.");
      } else {
        await createSupplier(payload);
        setSuccess("Supplier added successfully.");
      }
      const refreshed = await fetchSuppliers();
      setSuppliers(Array.isArray(refreshed) ? refreshed : []);
      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (supplier) => {
    setEditingId(supplier?.supplierId ?? null);
    setForm({
      supplierId: supplier?.supplierId ?? null,
      name: supplier?.name ?? "",
      phone: supplier?.phone ?? "",
      email: supplier?.email ?? "",
      address: supplier?.address ?? "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (supplier) => {
    if (!supplier?.supplierId) return;
    if (!window.confirm(`Delete ${supplier.name}?`)) {
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteSupplier(supplier.supplierId);
      setSuccess("Supplier deleted successfully.");
      const refreshed = await fetchSuppliers();
      setSuppliers(Array.isArray(refreshed) ? refreshed : []);
      if (editingId === supplier.supplierId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete supplier.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Suppliers</h2>
          <p className="text-secondary font-12 mb-0">
            Track vendors and their contact details for replenishment.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <span className="fw-semibold">
            {editingId ? "Edit supplier" : "Add supplier"}
          </span>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Name</label>
              <input
                name="name"
                className="form-control"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Phone</label>
              <input
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                className="form-control"
                rows={2}
                value={form.address}
                onChange={handleChange}
              />
            </div>
            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Saving..." : editingId ? "Update" : "Add supplier"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
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
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary py-4">
                      Loading suppliers...
                    </td>
                  </tr>
                )}
                {!loading && suppliers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-secondary py-4">
                      No suppliers have been added yet.
                    </td>
                  </tr>
                )}
                {suppliers.map((supplier) => (
                  <tr key={supplier.supplierId}>
                    <td>{supplier.name}</td>
                    <td>{supplier.phone ?? "—"}</td>
                    <td>{supplier.email ?? "—"}</td>
                    <td>{supplier.address ?? "—"}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => startEdit(supplier)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(supplier)}
                          disabled={submitting}
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
        </div>
      </div>
    </div>
  );
};

export default Suppliers;

