const taxes = [
  {
    taxId: "PPN-TAX-301",
    reference: "PPN-ORD-2301",
    type: "SALES",
    taxAmount: 15.76,
    taxDate: "2025-09-18 10:45",
    branch: "Central Market Branch",
  },
  {
    taxId: "PPN-TAX-302",
    reference: "PPN-PO-1105",
    type: "PURCHASE",
    taxAmount: 63.5,
    taxDate: "2025-09-15 08:10",
    branch: "Central Market Branch",
  },
  {
    taxId: "PPN-TAX-303",
    reference: "PPN-ORD-2302",
    type: "SALES",
    taxAmount: 9.92,
    taxDate: "2025-09-18 13:20",
    branch: "Russian Market Branch",
  },
];

const Taxes = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Taxes</h2>
      <div className="text-secondary font-12 mb-3">
        Static table for the `tax` entries covering Phnom Penh operations
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Reference</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Branch</th>
                <th>Tax Date</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map((tax) => (
                <tr key={tax.taxId}>
                  <td>{tax.taxId}</td>
                  <td>{tax.reference}</td>
                  <td>{tax.type}</td>
                  <td>${tax.taxAmount.toFixed(2)}</td>
                  <td>{tax.branch}</td>
                  <td>{tax.taxDate}</td>
                </tr>
              ))}
              {taxes.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-secondary py-4">
                    No tax entries yet.
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

export default Taxes;
