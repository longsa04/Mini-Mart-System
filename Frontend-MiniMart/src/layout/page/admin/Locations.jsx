const locations = [
  {
    locationId: "PPN-LOC-01",
    name: "Central Market Branch",
    address: "Street 130, Daun Penh, Phnom Penh",
  },
  {
    locationId: "PPN-LOC-02",
    name: "Russian Market Branch",
    address: "Street 155, Tuol Tum Poung, Phnom Penh",
  },
  {
    locationId: "PPN-LOC-03",
    name: "Tuol Kork Express",
    address: "Street 315, Tuol Kork, Phnom Penh",
  },
];

const Locations = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Locations</h2>
      <div className="text-secondary font-12 mb-3">
        Static view for the `location` table around Phnom Penh
      </div>
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-striped table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.locationId}>
                  <td>{location.locationId}</td>
                  <td>{location.name}</td>
                  <td>{location.address}</td>
                </tr>
              ))}
              {locations.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center text-secondary py-4">
                    No locations defined.
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

export default Locations;
