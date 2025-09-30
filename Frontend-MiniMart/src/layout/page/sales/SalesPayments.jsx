const payments = [
  {
    paymentId: "PPN-PAY-5101",
    orderId: "PPN-ORD-2301",
    method: "CASH",
    amount: 315.25,
    receivedAmount: 320.0,
    changeAmount: 4.75,
    user: "sokha",
    branch: "Central Market Branch",
    paidAt: "2025-09-18 10:47",
  },
  {
    paymentId: "PPN-PAY-5102",
    orderId: "PPN-ORD-2302",
    method: "KHQR",
    amount: 150.0,
    receivedAmount: 150.0,
    changeAmount: 0,
    user: "sreypov",
    branch: "Russian Market Branch",
    paidAt: "2025-09-18 13:25",
  },
];

const SalesPayments = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Payments</h2>
      <div className="text-secondary font-12 mb-3">
        Sample data for the `payment` table joined with Phnom Penh branches
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Payment ID</th>
                <th>Order ID</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Received</th>
                <th>Change</th>
                <th>Processed By</th>
                <th>Branch</th>
                <th>Paid At</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.paymentId}>
                  <td>{payment.paymentId}</td>
                  <td>{payment.orderId}</td>
                  <td>{payment.method}</td>
                  <td>${payment.amount.toFixed(2)}</td>
                  <td>${payment.receivedAmount.toFixed(2)}</td>
                  <td>${payment.changeAmount.toFixed(2)}</td>
                  <td>{payment.user}</td>
                  <td>{payment.branch}</td>
                  <td>{payment.paidAt}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-secondary py-4">
                    No payments recorded yet.
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

export default SalesPayments;
