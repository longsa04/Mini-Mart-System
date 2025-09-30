const administrators = [
  { id: 1, name: "Teat Isa", email: "isa001@pos.com", role: "Owner" },
  { id: 2, name: "Jane Cooper", email: "jane.cooper@pos.com", role: "Manager" },
];

const Administrator = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Administrators</h2>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {administrators.map((person, index) => (
                <tr key={person.id}>
                  <td>{index + 1}</td>
                  <td>{person.name}</td>
                  <td>{person.email}</td>
                  <td>{person.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Administrator;
