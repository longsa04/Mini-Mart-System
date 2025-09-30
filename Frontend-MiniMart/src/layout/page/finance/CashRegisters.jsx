const registers = [
  {
    registerId: "PPN-REG-01",
    location: "Central Market Branch",
    user: "sokha",
    openingBalance: 150.0,
    closingBalance: 865.75,
    registerDate: "2025-09-18",
    shift: "MORNING",
  },
  {
    registerId: "PPN-REG-02",
    location: "Russian Market Branch",
    user: "sreypov",
    openingBalance: 120.0,
    closingBalance: 412.3,
    registerDate: "2025-09-17",
    shift: "EVENING",
  },
  {
    registerId: "PPN-REG-03",
    location: "Tuol Kork Express",
    user: "vuthy",
    openingBalance: 80.0,
    closingBalance: 256.6,
    registerDate: "2025-09-18",
    shift: "AFTERNOON",
  },
];

const CashRegisters = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Cash Registers</h2>
      <div className="text-secondary font-12 mb-3">
        Placeholder for the `cash_register` table in Phnom Penh branches
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Register</th>
                <th>Location</th>
                <th>Handled By</th>
                <th>Opening</th>
                <th>Closing</th>
                <th>Shift</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {registers.map((register) => (
                <tr key={register.registerId}>
                  <td>{register.registerId}</td>
                  <td>{register.location}</td>
                  <td>{register.user}</td>
                  <td>${register.openingBalance.toFixed(2)}</td>
                  <td>${register.closingBalance.toFixed(2)}</td>
                  <td>{register.shift}</td>
                  <td>{register.registerDate}</td>
                </tr>
              ))}
              {registers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-secondary py-4">
                    No register sessions tracked.
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

export default CashRegisters;
