const orders = [
  {
    id: "INV-1048",
    customer: "Walk-in",
    items: 4,
    total: 23.5,
    status: "Paid",
  },
  { id: "INV-1047", customer: "Liam", items: 2, total: 8.75, status: "Hold" },
  { id: "INV-1046", customer: "Emma", items: 6, total: 31.2, status: "Paid" },
];

const PosOrder = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Recent POS Orders</h2>
      <p className="text-muted">
        This view is fed by static data for now. Hook it to the backend once
        endpoints are ready.
      </p>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.items}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge bg-${
                        order.status === "Paid" ? "success" : "warning"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PosOrder;
