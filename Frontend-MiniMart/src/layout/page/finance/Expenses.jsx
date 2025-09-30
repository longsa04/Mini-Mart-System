const expenses = [
  {
    expenseId: "PPN-EXP-901",
    location: "Central Market Branch",
    description: "EDC Utility Bill",
    amount: 132.0,
    category: "UTILITIES",
    user: "sokha",
    expenseDate: "2025-09-05 14:10",
  },
  {
    expenseId: "PPN-EXP-902",
    location: "Tuol Kork Express",
    description: "Motorbike delivery service",
    amount: 65.5,
    category: "LOGISTICS",
    user: "vuthy",
    expenseDate: "2025-09-08 09:42",
  },
  {
    expenseId: "PPN-EXP-903",
    location: "Russian Market Branch",
    description: "Storefront cleaning",
    amount: 42.75,
    category: "MAINTENANCE",
    user: "sreypov",
    expenseDate: "2025-09-12 07:55",
  },
];

const Expenses = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Expenses</h2>
      <div className="text-secondary font-12 mb-3">
        Static dataset for the `expense` table in Phnom Penh branches
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Location</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Entered By</th>
                <th>Expense Date</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.expenseId}>
                  <td>{expense.expenseId}</td>
                  <td>{expense.location}</td>
                  <td>{expense.description}</td>
                  <td>{expense.category}</td>
                  <td>${expense.amount.toFixed(2)}</td>
                  <td>{expense.user}</td>
                  <td>{expense.expenseDate}</td>
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-4">
                    No expenses captured yet.
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

export default Expenses;
