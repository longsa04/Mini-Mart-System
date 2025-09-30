const Account = () => {
  return (
    <>
      <div>
        <div className="row">
          <div className="col-xl-9 col-md-7 col-12">
            <div className="card border-0">
              <div className="card-body">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <td>No</td>
                      <td>AccnountName</td>
                      <td>Code</td>
                      <td>Account Type</td>
                      <td>Action</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Cash</td>
                      <td>1201</td>
                      <td>Capital</td>
                      <td>Action</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-5 col-12">
            <div className="d-block m-auto px-2 py-3 bg-white">
              <div className="menu-item border-bottom">
                <span className="menu-icon">
                  <i className="fa-solid fa-circle-plus"></i>
                </span>
                <span className="btn-menu-link">Create New Account</span>
              </div>

              <div className="menu-item border-bottom">
                <span className="menu-icon">
                  <i className="fa-solid fa-trash"></i>
                </span>
                <span className="btn-menu-link">Multi Remove Account</span>
              </div>
              <div className="menu-item border-bottom">
                <span className="menu-icon">
                  <i className="fa-solid fa-file"></i>
                </span>
                <span className="btn-menu-link">View All Account</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Account;
