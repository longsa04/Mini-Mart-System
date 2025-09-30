import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../../api/users";
import { fetchLocations } from "../../../api/locations";

const ROLE_OPTIONS = ["CASHIER", "MANAGER"];
const SHIFT_OPTIONS = ["MORNING", "AFTERNOON", "EVENING"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

const defaultForm = {
  userId: null,
  username: "",
  password: "",
  role: ROLE_OPTIONS[0],
  shift: SHIFT_OPTIONS[0],
  status: STATUS_OPTIONS[0],
  phone: "",
  email: "",
  locationId: "",
};

const normalizePhone = (value) => value.trim();
const toTitleCase = (value) =>
  value
    .toLowerCase()
    .split(" ")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = async (signal) => {
    setError(null);
    try {
      const [usersData, locationData] = await Promise.all([
        fetchUsers({ signal }),
        fetchLocations({ signal }),
      ]);

      if (signal?.aborted) {
        return;
      }

      const filtered = (usersData ?? [])
        .filter((user) => {
          const role = String(user?.role ?? "");
          return ROLE_OPTIONS.includes(role);
        })
        .map((user) => {
          const locationId =
            user?.locationId ?? user?.location?.locationId ?? null;
          const locationName =
            user?.locationName ?? user?.location?.name ?? null;

          return {
            ...user,
            locationId,
            locationName,
          };
        });

      setEmployees(filtered);
      setLocations(locationData ?? []);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message || "Unable to load employees.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    loadData(controller.signal).finally(() => {
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
    setForm(defaultForm);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.username.trim()) {
      setError("Username is required.");
      return;
    }

    if (!editingId && !form.password.trim()) {
      setError("Password is required when creating an employee.");
      return;
    }

    const payload = {
      username: form.username.trim(),
      role: form.role,
      shift: form.shift,
      status: form.status,
      phone: form.phone ? normalizePhone(form.phone) : null,
      email: form.email ? form.email.trim() : null,
      locationId: form.locationId ? Number(form.locationId) : null,
    };

    if (!editingId || form.password.trim()) {
      payload.password = form.password.trim();
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await updateUser(editingId, payload);
        setSuccess("Employee updated successfully.");
      } else {
        await createUser(payload);
        setSuccess("Employee added successfully.");
      }
      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (employee) => {
    setEditingId(employee?.userId ?? null);
    setForm({
      userId: employee?.userId ?? null,
      username: employee?.username ?? "",
      password: "",
      role: employee?.role ?? ROLE_OPTIONS[0],
      shift: employee?.shift ?? SHIFT_OPTIONS[0],
      status: employee?.status ?? STATUS_OPTIONS[0],
      phone: employee?.phone ?? "",
      email: employee?.email ?? "",
      locationId:
        employee?.locationId != null ? String(employee.locationId) : "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (employee) => {
    if (!employee?.userId) return;
    const confirmed = window.confirm(
      `Remove ${employee.username}? This action cannot be undone.`
    );
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteUser(employee.userId);
      setSuccess("Employee removed successfully.");
      await loadData();
      if (editingId === employee.userId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to remove employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const locationOptions = useMemo(
    () =>
      (locations ?? []).map((location) => ({
        id: location?.locationId,
        name: location?.name ?? `Location ${location?.locationId ?? ""}`,
      })),
    [locations]
  );

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">Employees</h2>
          <p className="text-secondary font-12 mb-0">
            Manage store staff accounts (cashiers and floor managers).
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <div className="fw-semibold">
            {editingId ? "Edit employee" : "Add new employee"}
          </div>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Username</label>
              <input
                name="username"
                className="form-control"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">
                Password{editingId ? " (leave blank to keep)" : ""}
              </label>
              <input
                type="password"
                name="password"
                className="form-control"
                value={form.password}
                onChange={handleChange}
                placeholder={editingId ? "********" : "Enter password"}
                required={!editingId}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {toTitleCase(role.replace("_", " "))}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-4">
              <label className="form-label">Shift</label>
              <select
                name="shift"
                className="form-select"
                value={form.shift}
                onChange={handleChange}
              >
                {SHIFT_OPTIONS.map((shift) => (
                  <option key={shift} value={shift}>
                    {toTitleCase(shift.toLowerCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {toTitleCase(status.toLowerCase())}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Location</label>
              <select
                name="locationId"
                className="form-select"
                value={form.locationId ?? ""}
                onChange={handleChange}
              >
                <option value="">All branches</option>
                {locationOptions.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
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

            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Add employee"}
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
                  <th>Username</th>
                  <th>Role</th>
                  <th>Shift</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={8} className="text-center text-secondary py-4">
                      Loading employees...
                    </td>
                  </tr>
                )}
                {!loading && employees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-secondary py-4">
                      No employees found yet.
                    </td>
                  </tr>
                )}
                {employees.map((employee) => (
                  <tr key={employee.userId}>
                    <td>{employee.username}</td>
                    <td>
                      {toTitleCase(String(employee.role ?? "").toLowerCase())}
                    </td>
                    <td>
                      {toTitleCase(String(employee.shift ?? "").toLowerCase())}
                    </td>
                    <td>
                      {toTitleCase(String(employee.status ?? "").toLowerCase())}
                    </td>
                    <td>{employee?.locationName ?? "All"}</td>
                    <td>{employee.phone ?? "�"}</td>
                    <td>{employee.email ?? "�"}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => startEdit(employee)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(employee)}
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

export default Employees;
