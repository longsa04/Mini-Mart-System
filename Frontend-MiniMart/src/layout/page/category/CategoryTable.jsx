const sampleCategories = [
  { id: 1, name: "Beverages", description: "Soft drinks, juices, and bottled water" },
  { id: 2, name: "Snacks", description: "Chips, candy, and grab-and-go bites" },
  { id: 3, name: "Household", description: "Cleaning supplies and essentials" },
];

const CategoryTable = () => {
  return (
    <div className="container mt-4">
      <h2 className="mb-3">Category Table</h2>
      <p className="text-muted">
        Categories are currently static while we wait on the backend API. Update this list from a service once it is ready.
      </p>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {sampleCategories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryTable;
