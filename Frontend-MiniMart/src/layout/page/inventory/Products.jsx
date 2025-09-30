import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchProducts as fetchProductsApi,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../api/products";
import { fetchCategories } from "../../../api/categories";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const emptyForm = {
  productId: null,
  name: "",
  sku: "",
  price: "",
  categoryId: "",
};

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
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

    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [loadedProducts, loadedCategories] = await Promise.all([
          fetchProductsApi({ signal: controller.signal }),
          fetchCategories({ signal: controller.signal }),
        ]);

        setProducts(Array.isArray(loadedProducts) ? loadedProducts : []);
        setCategories(Array.isArray(loadedCategories) ? loadedCategories : []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") {
          return;
        }
        setError(fetchError.message || "Unable to load products");
        setProducts([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    return () => controller.abort();
  }, []);

  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      id: category.id ?? category.categoryId,
      name: category.name,
    }));
  }, [categories]);

  const resetForm = () => {
    setFormValues(emptyForm);
    setFormMode("create");
    setFormError(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formValues.name.trim()) {
      return "Product name is required.";
    }

    if (!formValues.sku.trim()) {
      return "SKU is required.";
    }

    const priceNumber = Number(formValues.price);
    if (Number.isNaN(priceNumber) || priceNumber <= 0) {
      return "Price must be a positive number.";
    }

    if (!formValues.categoryId) {
      return "Please choose a category.";
    }

    return null;
  };

  const refreshProducts = async () => {
    const updated = await fetchProductsApi();
    setProducts(Array.isArray(updated) ? updated : []);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);
    setFeedback(null);

    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      sku: formValues.sku.trim(),
      price: Number(formValues.price),
      categoryId: Number(formValues.categoryId),
    };

    try {
      setSubmitting(true);
      if (formMode === "create") {
        await createProduct(payload);
        setFeedback("Product successfully created.");
      } else {
        await updateProduct(formValues.productId, payload);
        setFeedback("Product updated.");
      }
      await refreshProducts();
      resetForm();
    } catch (submitError) {
      setFormError(submitError.message || "Unable to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setFormMode("edit");
    setFormValues({
      productId: product.productId ?? product.id,
      name: product.name ?? "",
      sku: product.sku ?? "",
      price: product.price != null ? String(product.price) : "",
      categoryId: product.category?.id ?? product.category?.categoryId
        ? String(product.category.id ?? product.category.categoryId)
        : "",
    });
    setFormError(null);
    setFeedback(null);
  };

  const handleDelete = async (product) => {
    const productId = product.productId ?? product.id;
    if (!productId) return;

    const confirmation = window.confirm(
      `Delete ${product.name ?? "this product"}?`
    );

    if (!confirmation) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteProduct(productId);
      setFeedback("Product deleted.");
      await refreshProducts();
      if (formMode === "edit" && formValues.productId === productId) {
        resetForm();
      }
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete product.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasProducts = products.length > 0;

  const renderBody = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="text-center text-secondary py-4">
            Loading products...
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} className="text-center text-danger py-4">
            {error}
          </td>
        </tr>
      );
    }

    if (!hasProducts) {
      return (
        <tr>
          <td colSpan={6} className="text-center text-secondary py-4">
            No products found.
          </td>
        </tr>
      );
    }

    return products.map((product) => (
      <tr key={product.productId ?? product.id ?? product.sku}>
        <td>{product.name ?? "Unnamed"}</td>
        <td>{product.sku ?? "-"}</td>
        <td>{product.category?.name ?? "Unassigned"}</td>
        <td>{
          product.price != null
            ? priceFormatter.format(product.price)
            : "-"
        }</td>
        <td>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => handleEdit(product)}
              disabled={submitting}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDelete(product)}
              disabled={submitting}
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="page">
      <h2 className="mb-3">Product Catalog</h2>
      <div className="text-secondary font-12 mb-3">
        Manage items available at the Central Market Flagship store. Add new SKUs, update pricing, or remove items from the catalog.
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h3 className="h6 mb-3">
            {formMode === "create" ? "Add Product" : "Edit Product"}
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

          {!categoryOptions.length && (
            <div
              className="alert alert-warning d-flex justify-content-between align-items-center"
              role="alert"
            >
              <span>
                No categories yet. Create one in Category Manager before adding products.
              </span>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => navigate("/inventory/categories")}
              >
                Open Category Manager
              </button>
            </div>
          )}

          <form className="row g-3" onSubmit={handleSubmit}>
            <div className="col-md-4">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formValues.name}
                onChange={handleInputChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">SKU</label>
              <input
                type="text"
                className="form-control"
                name="sku"
                value={formValues.sku}
                onChange={handleInputChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="col-md-2">
              <label className="form-label">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                name="price"
                value={formValues.price}
                onChange={handleInputChange}
                disabled={submitting}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                name="categoryId"
                value={formValues.categoryId}
                onChange={handleInputChange}
                disabled={submitting || !categoryOptions.length}
                required
              >
                <option value="">Select a category</option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {formMode === "create" ? "Create Product" : "Save Changes"}
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
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
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

export default Products;




