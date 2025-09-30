import { useState } from "react";

import { useNavigate } from "react-router-dom";
const CreateItem = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    sku: "",
  });

  // Static data
  const [items, setItems] = useState([
    { id: 1, name: "Coca-Cola", price: 1.99, category: "Drink", sku: "SKU001" },
    { id: 2, name: "Burger", price: 5.5, category: "Food", sku: "SKU002" },
  ]);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle form submit (static: just add to table state)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.sku) return;

    const newItem = {
      id: items.length + 1,
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      sku: form.sku,
    };

    setItems([...items, newItem]);

    // Reset form
    setForm({ name: "", price: "", category: "", sku: "" });
  };

  function goBackItemList() {
    navigate("/list-items");
  }
  return (
    <div className="container mt-4">
      <button className="btn btn-primary mb-2" onClick={goBackItemList}>
        <span className="fa fa-arrow-left"></span>
        Back
      </button>
      <h2>Create Item</h2>

      {/* Form */}
      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="row mb-2">
          <div className="col">
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <input
              type="number"
              name="price"
              className="form-control"
              placeholder="Price"
              value={form.price}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <input
              type="text"
              name="category"
              className="form-control"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col">
            <input
              type="text"
              name="sku"
              className="form-control"
              placeholder="SKU"
              value={form.sku}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Add Item
        </button>
      </form>

      {/* Items Table */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>SKU</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>{item.category}</td>
                <td>{item.sku}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No items yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CreateItem;
