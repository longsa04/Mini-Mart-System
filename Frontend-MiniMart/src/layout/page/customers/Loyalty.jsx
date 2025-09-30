const loyaltyBreakdown = [
  {
    customerId: "PPN-CUS-003",
    name: "Sok Ratana",
    tier: "Gold",
    points: 540,
    pointsEarned: 180,
    pointsRedeemed: 60,
    homeDistrict: "Chamkarmon",
  },
  {
    customerId: "PPN-CUS-001",
    name: "Chan Dara",
    tier: "Silver",
    points: 320,
    pointsEarned: 140,
    pointsRedeemed: 40,
    homeDistrict: "Tuol Tum Poung",
  },
  {
    customerId: "PPN-CUS-004",
    name: "Phan Sreyna",
    tier: "Bronze",
    points: 160,
    pointsEarned: 90,
    pointsRedeemed: 20,
    homeDistrict: "Chroy Changvar",
  },
];

const Loyalty = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Loyalty Points</h2>
      <div className="text-secondary font-12 mb-3">
        Sample dataset for tracking `customer.points` in Phnom Penh districts
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Customer</th>
                <th>Tier</th>
                <th>Current Points</th>
                <th>Points Earned</th>
                <th>Points Redeemed</th>
                <th>Home District</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyBreakdown.map((item) => (
                <tr key={item.customerId}>
                  <td>{item.name}</td>
                  <td>{item.tier}</td>
                  <td>{item.points}</td>
                  <td>{item.pointsEarned}</td>
                  <td>{item.pointsRedeemed}</td>
                  <td>{item.homeDistrict}</td>
                </tr>
              ))}
              {loyaltyBreakdown.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-secondary py-4">
                    No loyalty activity yet.
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

export default Loyalty;
