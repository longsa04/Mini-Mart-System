import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const UpdateItem = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Static items data (for demo only)
  const [items] = useState([
    { id: 1, name: "Coca-Cola", price: 1.99, category: "Drink", sku: "SKU001" },
    { id: 2, name: "Burger", price: 5.5, category: "Food", sku: "SKU002" },
  ]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    sku: "",
  });

  useEffect(() => {
    const numericId = Number(id);
    const found = items.find((it) => it.id === numericId) || items[0];
    if (found) {
      setForm({
        name: found.name,
        price: found.price,
        category: found.category,
        sku: found.sku,
      });
    }
  }, [id, items]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category || !form.sku) return;
    // Static demo: just show a message and navigate back
    alert("Static: Item updated successfully.");
    navigate("/list-items");
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
      <h2>Update Item</h2>

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
          Update Item
        </button>
      </form>
    </div>
  );
};

export default UpdateItem;
