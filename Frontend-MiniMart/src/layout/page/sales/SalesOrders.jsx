const orders = [
  {
    orderId: "PPN-ORD-2301",
    customer: "Walk-in (Daun Penh)",
    total: 315.25,
    discount: 15,
    paymentStatus: "PAID",
    location: "Central Market Branch",
    user: "sokha",
    createdAt: "2025-09-18 10:45",
  },
  {
    orderId: "PPN-ORD-2302",
    customer: "Chan Dara",
    total: 198.4,
    discount: 0,
    paymentStatus: "PARTIAL",
    location: "Russian Market Branch",
    user: "sreypov",
    createdAt: "2025-09-18 13:20",
  },
  {
    orderId: "PPN-ORD-2303",
    customer: "Ly Kimleng",
    total: 86.9,
    discount: 5,
    paymentStatus: "PENDING",
    location: "Tuol Kork Express",
    user: "vuthy",
    createdAt: "2025-09-18 17:05",
  },
];

const SalesOrders = () => {
  return (
    <div className="page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Sales Orders</h2>
        <div className="text-secondary font-12">
          Matching `orders` table with customer and user records for Phnom Penh
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Discount</th>
                <th>Payment Status</th>
                <th>Location</th>
                <th>Salesperson</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderId}</td>
                  <td>{order.customer}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>${order.discount.toFixed(2)}</td>
                  <td>
                    <span className="badge bg-success-subtle text-success">
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{order.location}</td>
                  <td>{order.user}</td>
                  <td>{order.createdAt}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-secondary py-4">
                    No sales orders yet.
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

export default SalesOrders;
