import "./item.css";

import { useNavigate } from "react-router-dom";

const Item = () => {
  const navigate = useNavigate();
  // Static items list
  const items = [
    {
      id: 1,
      name: "Coca-Cola",
      price: 1.99,
      category: "Beverages",
      sku: "COKE123",
    },
    {
      id: 2,
      name: "Pepsi",
      price: 1.89,
      category: "Beverages",
      sku: "PEPSI456",
    },
    {
      id: 3,
      name: "Orange Juice",
      price: 2.49,
      category: "Beverages",
      sku: "OJ789",
    },
    { id: 4, name: "Water", price: 0.99, category: "Beverages", sku: "WAT123" },
    {
      id: 5,
      name: "Lemonade",
      price: 1.49,
      category: "Beverages",
      sku: "LEM456",
    },
    {
      id: 6,
      name: "Ice Tea",
      price: 1.79,
      category: "Beverages",
      sku: "ICET789",
    },
    {
      id: 7,
      name: "Coffee",
      price: 2.99,
      category: "Beverages",
      sku: "COF123",
    },
    {
      id: 8,
      name: "Pringles",
      price: 3.49,
      category: "Snacks",
      sku: "PRING456",
    },
    {
      id: 9,
      name: "Chocolate Bar",
      price: 1.29,
      category: "Snacks",
      sku: "CHOC789",
    },
    {
      id: 10,
      name: "Gummy Bears",
      price: 0.99,
      category: "Snacks",
      sku: "GUM123",
    },
    {
      id: 11,
      name: "Trail Mix",
      price: 2.49,
      category: "Snacks",
      sku: "TRAIL456",
    },
    { id: 12, name: "Popcorn", price: 1.99, category: "Snacks", sku: "POP789" },
  ];

  // Dummy functions (static demo only)
  function addNewItem() {
    // alert("Static: Add New Item form would open here.");
    navigate("/create-item");
  }
  function editItem(id) {
    alert(`Static: Edit Item with ID ${id}`);

    navigate("/update-item/" + id);
  }
  function deleteItem(id) {
    alert(`Static: Delete Item with ID ${id}`);
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Items List</h2>

      {/* Add new item button */}
      <button className="btn btn-primary mb-3" onClick={addNewItem}>
        <i className="fa-solid fa-plus me-2"></i>
        Add Item
      </button>

      {/* Items Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table table-bordered table-hover item-table rounded">
            <thead className="table-light">
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>SKU</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((f, i) => (
                <tr key={f.id}>
                  <td>{i + 1}</td>
                  <td>{f.name}</td>
                  <td>${f.price.toFixed(2)}</td>
                  <td>{f.category}</td>
                  <td>{f.sku}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-2 px-3 py-1 rounded-pill shadow-sm"
                      onClick={() => editItem(f.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger px-3 py-1 rounded-pill shadow-sm"
                      onClick={() => deleteItem(f.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No items available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Item;
