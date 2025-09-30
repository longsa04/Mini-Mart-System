const activeCarts = [
  {
    cartId: "PPN-CART-01",
    cashier: "sreypov",
    branch: "Russian Market Branch",
    items: 6,
    total: 48.6,
    lastUpdated: "2025-09-18 13:21",
  },
  {
    cartId: "PPN-CART-02",
    cashier: "vuthy",
    branch: "Tuol Kork Express",
    items: 3,
    total: 22.4,
    lastUpdated: "2025-09-18 17:06",
  },
];

const recentReceipts = [
  {
    receipt: "PPN-REC-2301",
    orderId: "PPN-ORD-2301",
    paymentMethod: "CASH",
    total: 315.25,
    change: 4.75,
    processedBy: "sokha",
    timestamp: "2025-09-18 10:47",
  },
  {
    receipt: "PPN-REC-2302",
    orderId: "PPN-ORD-2302",
    paymentMethod: "KHQR",
    total: 150.0,
    change: 0,
    processedBy: "sreypov",
    timestamp: "2025-09-18 13:25",
  },
];

const frequentlyScannedItems = [
  {
    sku: "RICE-PP-JSM5",
    name: "Jasmine Rice 5kg",
    scansToday: 42,
    avgBasketPrice: 12.6,
  },
  {
    sku: "DRINK-PP-CFE1",
    name: "Cambodian Iced Coffee Beans",
    scansToday: 28,
    avgBasketPrice: 17.4,
  },
  {
    sku: "SNACK-PP-BANH",
    name: "Banana Chips (Local)",
    scansToday: 19,
    avgBasketPrice: 8.9,
  },
];

const Checkout = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Checkout Activity</h2>
      <p className="text-secondary font-12 mb-4">
        Static POS snapshot for Phnom Penh branches. A foundation for upcoming
        checkout APIs.
      </p>

      <div className="row g-3 mb-4">
        {activeCarts.map((cart) => (
          <div className="col-md-6" key={cart.cartId}>
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="fw-semibold">
                    Cart {cart.cartId.replace("PPN-CART-", "#")}
                  </div>
                  <span className="badge bg-primary-subtle text-primary">
                    {cart.branch}
                  </span>
                </div>
                <div className="text-secondary font-12 mb-2">
                  Cashier:{" "}
                  <span className="text-dark fw-semibold">{cart.cashier}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="text-secondary font-12">Items</div>
                    <div className="fs-4 fw-bold">{cart.items}</div>
                  </div>
                  <div>
                    <div className="text-secondary font-12">Cart Total</div>
                    <div className="fs-4 fw-bold">${cart.total.toFixed(2)}</div>
                  </div>
                </div>
                <div className="text-muted font-12 mt-2">
                  Updated {cart.lastUpdated}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card shadow-sm mb-3">
            <div className="card-header bg-white">
              <div className="fw-semibold">Latest Receipts</div>
              <div className="text-secondary font-12">
                Tally of completed orders in Phnom Penh checkout lanes
              </div>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Receipt</th>
                    <th>Order</th>
                    <th>Payment</th>
                    <th>Total</th>
                    <th>Change</th>
                    <th>Processed By</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReceipts.map((receipt) => (
                    <tr key={receipt.receipt}>
                      <td>{receipt.receipt}</td>
                      <td>{receipt.orderId}</td>
                      <td>{receipt.paymentMethod}</td>
                      <td>${receipt.total.toFixed(2)}</td>
                      <td>${receipt.change.toFixed(2)}</td>
                      <td>{receipt.processedBy}</td>
                      <td>{receipt.timestamp}</td>
                    </tr>
                  ))}
                  {recentReceipts.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center text-secondary py-4"
                      >
                        No receipts yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-white">
              <div className="fw-semibold">Frequently Scanned Items</div>
              <div className="text-secondary font-12">
                Trending in Phnom Penh today
              </div>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>SKU</th>
                    <th>Item</th>
                    <th>Scans</th>
                    <th>Avg Basket ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {frequentlyScannedItems.map((item) => (
                    <tr key={item.sku}>
                      <td>{item.sku}</td>
                      <td>{item.name}</td>
                      <td>{item.scansToday}</td>
                      <td>{item.avgBasketPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                  {frequentlyScannedItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-secondary py-4"
                      >
                        No scan activity yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
