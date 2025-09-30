import { useEffect, useMemo, useState } from "react";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../../api/users";
import { fetchLocations } from "../../../api/locations";

const ROLE_OPTIONS = ["ADMIN", "MANAGER", "CASHIER"];
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

const toLabel = (value) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const Users = () => {
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const loadData = async (signal) => {
    setError(null);
    try {
      const [userData, locationData] = await Promise.all([
        fetchUsers({ signal }),
        fetchLocations({ signal }),
      ]);

      if (signal?.aborted) {
        return;
      }

      setUsers(userData ?? []);
      setLocations(locationData ?? []);
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }
      setError(err.message || "Unable to load users.");
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

  const filteredUsers = useMemo(() => {
    if (roleFilter === "ALL") {
      return users;
    }
    return users.filter((user) => String(user.role) === roleFilter);
  }, [users, roleFilter]);

  const locationOptions = useMemo(
    () =>
      (locations ?? []).map((location) => ({
        id: location?.locationId,
        name: location?.name ?? `Location ${location?.locationId ?? ""}`,
      })),
    [locations]
  );

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
      setError("Password is required when creating a user.");
      return;
    }

    const payload = {
      username: form.username.trim(),
      role: form.role,
      shift: form.shift,
      status: form.status,
      phone: form.phone ? form.phone.trim() : null,
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
        setSuccess("User updated successfully.");
      } else {
        await createUser(payload);
        setSuccess("User created successfully.");
      }
      await loadData();
      resetForm();
    } catch (err) {
      setError(err.message || "Unable to save user.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (user) => {
    setEditingId(user?.userId ?? null);
    setForm({
      userId: user?.userId ?? null,
      username: user?.username ?? "",
      password: "",
      role: user?.role ?? ROLE_OPTIONS[0],
      shift: user?.shift ?? SHIFT_OPTIONS[0],
      status: user?.status ?? STATUS_OPTIONS[0],
      phone: user?.phone ?? "",
      email: user?.email ?? "",
      locationId: user?.location?.locationId ?? "",
    });
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (user) => {
    if (!user?.userId) return;
    if (!window.confirm(`Delete ${user.username}?`)) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await deleteUser(user.userId);
      setSuccess("User removed successfully.");
      await loadData();
      if (editingId === user.userId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Unable to delete user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-1">User & Roles</h2>
          <p className="text-secondary font-12 mb-0">
            Maintain system logins for admins, managers, and cashiers.
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <label className="text-secondary font-12 mb-0" htmlFor="role-filter">
            Filter by role
          </label>
          <select
            id="role-filter"
            className="form-select form-select-sm"
            style={{ width: "180px" }}
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="ALL">All roles</option>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {toLabel(role)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-white">
          <div className="fw-semibold">
            {editingId ? "Edit user" : "Create user"}
          </div>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-3">
              <label className="form-label">Username</label>
              <input
                name="username"
                className="form-control"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-3">
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
            <div className="col-md-2">
              <label className="form-label">Role</label>
              <select
                name="role"
                className="form-select"
                value={form.role}
                onChange={handleChange}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {toLabel(role)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Shift</label>
              <select
                name="shift"
                className="form-select"
                value={form.shift}
                onChange={handleChange}
              >
                {SHIFT_OPTIONS.map((shift) => (
                  <option key={shift} value={shift}>
                    {toLabel(shift)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={form.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {toLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Location</label>
              <select
                name="locationId"
                className="form-select"
                value={form.locationId}
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
            <div className="col-md-3">
              <label className="form-label">Phone</label>
              <input
                name="phone"
                className="form-control"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-3">
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
                {submitting ? "Saving..." : editingId ? "Update" : "Create user"}
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
                      Loading users...
                    </td>
                  </tr>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-secondary py-4">
                      No users found.
                    </td>
                  </tr>
                )}
                {filteredUsers.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.username}</td>
                    <td>{toLabel(String(user.role ?? ""))}</td>
                    <td>{toLabel(String(user.shift ?? ""))}</td>
                    <td>{toLabel(String(user.status ?? ""))}</td>
                    <td>{user?.location?.name ?? "All"}</td>
                    <td>{user.phone ?? "—"}</td>
                    <td>{user.email ?? "—"}</td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => startEdit(user)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => handleDelete(user)}
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

export default Users;
