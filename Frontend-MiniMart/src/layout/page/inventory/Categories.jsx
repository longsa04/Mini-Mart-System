import { useEffect, useState } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../api/categories";

const emptyForm = {
  categoryId: null,
  name: "",
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formValues, setFormValues] = useState(emptyForm);
  const [formMode, setFormMode] = useState("create");
  const [formError, setFormError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories({ signal: controller.signal });
        setCategories(Array.isArray(data) ? data : []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError.message || "Unable to load categories");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
    return () => controller.abort();
  }, []);

  const resetForm = () => {
    setFormValues(emptyForm);
    setFormMode("create");
    setFormError(null);
  };

  const handleInputChange = (event) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };

  const refreshCategories = async () => {
    const updated = await fetchCategories();
    setCategories(Array.isArray(updated) ? updated : []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFeedback(null);

    const trimmedName = formValues.name.trim();
    if (!trimmedName) {
      setFormError("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      if (formMode === "create") {
        await createCategory({ name: trimmedName });
        setFeedback("Category created.");
      } else {
        await updateCategory(formValues.categoryId, { name: trimmedName });
        setFeedback("Category updated.");
      }
      await refreshCategories();
      resetForm();
    } catch (submitError) {
      setFormError(submitError.message || "Unable to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setFormMode("edit");
    setFormValues({
      categoryId: category.categoryId ?? category.id,
      name: category.name ?? "",
    });
    setFormError(null);
    setFeedback(null);
  };

  const handleDelete = async (category) => {
    const categoryId = category.categoryId ?? category.id;
    if (!categoryId) return;

    const confirmation = window.confirm(
      `Delete ${category.name ?? "this category"}?`
    );
    if (!confirmation) return;

    try {
      setSubmitting(true);
      await deleteCategory(categoryId);
      setFeedback("Category deleted.");
      await refreshCategories();
      if (formMode === "edit" && formValues.categoryId === categoryId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete category.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={3} className="text-center text-secondary py-4">
            Loading categories...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={3} className="text-center text-danger py-4">
            {error}
          </td>
        </tr>
      );
    }

    if (categories.length === 0) {
      return (
        <tr>
          <td colSpan={3} className="text-center text-secondary py-4">
            No categories defined yet.
          </td>
        </tr>
      );
    }

    return categories.map((category) => {
      const categoryId = category.categoryId ?? category.id;
      const productCount =
        category.productCount ?? category.products?.length ?? "-";

      return (
        <tr key={categoryId ?? category.name}>
          <td>{category.name ?? "Unnamed"}</td>
          <td>{productCount}</td>
          <td>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleEdit(category)}
                disabled={submitting}
              >
                Edit
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDelete(category)}
                disabled={submitting}
              >
                Delete
              </button>
            </div>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="page">
      <h2 className="mb-3">Category Manager</h2>
      <div className="text-secondary font-12 mb-3">
        Maintain product categories for the Central Market Flagship store.
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="h6 mb-3">
            {formMode === "create" ? "Add Category" : "Edit Category"}
          </h3>
          {formError && (
            <div className="alert alert-danger" role="alert">
              {formError}
            </div>
          )}
          {feedback && !formError && (
            <div className="alert alert-success" role="alert">
              {feedback}
            </div>
          )}

          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-6 col-lg-4">
              <label className="form-label">Category Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formValues.name}
                onChange={handleInputChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="col-12 d-flex gap-2 align-items-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {formMode === "create" ? "Create Category" : "Save Changes"}
              </button>
              {formMode === "edit" && (
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
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Products</th>
                <th style={{ width: "160px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>{renderBody()}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;
