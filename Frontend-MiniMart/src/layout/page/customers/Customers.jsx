const customers = [
  {
    customerId: "PPN-CUS-001",
    name: "Chan Dara",
    phone: "+855 12 456 789",
    email: "chan.dara@phnompenhmail.com",
    points: 320,
    lastPurchase: "2025-09-18 13:20",
    favoriteBranch: "Russian Market",
  },
  {
    customerId: "PPN-CUS-002",
    name: "Ly Kimleng",
    phone: "+855 78 223 344",
    email: "kimleng.ly@phnompenhmail.com",
    points: 95,
    lastPurchase: "2025-09-18 17:05",
    favoriteBranch: "Tuol Kork Express",
  },
  {
    customerId: "PPN-CUS-003",
    name: "Sok Ratana",
    phone: "+855 16 880 990",
    email: "ratana.sok@phnompenhmail.com",
    points: 540,
    lastPurchase: "2025-09-16 18:42",
    favoriteBranch: "Central Market",
  },
];

const Customers = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Customers</h2>
      <div className="text-secondary font-12 mb-3">
        Static representation of the `customer` table for Phnom Penh shoppers
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Loyalty Points</th>
                <th>Last Purchase</th>
                <th>Preferred Branch</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customerId}>
                  <td>{customer.customerId}</td>
                  <td>{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.email}</td>
                  <td>{customer.points}</td>
                  <td>{customer.lastPurchase}</td>
                  <td>{customer.favoriteBranch}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-4">
                    No customers yet.
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

export default Customers;
