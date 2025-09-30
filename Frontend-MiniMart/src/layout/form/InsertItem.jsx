import "./form.css";

const InsertItem = () => {
  return (
    <>
      <div>
        <div className="row">
          <div className="col-xl-9 col-md-7 col-12">
            <div
              className="form-heder w-100 bg-white"
              style={{ maxHeight: "130px" }}
            >
              <form className="d-flex h-100">
                <div className="d-block w-50 p-2">
                  <div>
                    <input
                      type="text"
                      className="border-0 border-bottom bg-none fs-3 w-100"
                      placeholder="Item name"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      className="border-0 border-bottom bg-none fs-3 w-100"
                      placeholder="Category"
                    />
                  </div>
                </div>
                <div
                  className="end p-2 w-50"
                  style={{ height: "120px", width: "70px", overflow: "hidden" }}
                >
                  <img
                    src="https://www.tasteofhome.com/wp-content/uploads/2024/05/Mushroom-Burgers_TOHcom24_36597_MD_P2_06_27_4b.jpg"
                    alt=""
                    className="h-100 box-shadow rounded"
                  />
                </div>
              </form>
            </div>
            <div className="center">
              <div>
                <form action="" className="w-100">
                  <div className="group-box w-100 d-flex bg-white rounded">
                    <div className="p-1">
                      <label htmlFor="item-name" className="me-3">
                        Item Name : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        Cost Price : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        Selling Price : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        Description : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        Calories : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />
                    </div>

                    <div className="p-1">
                      <label htmlFor="item-name" className="me-3">
                        IsAvialble : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        RecommentDrink : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        PreparationTime : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        Image : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />

                      <label htmlFor="item-name" className="me-3">
                        Branch : *
                      </label>
                      <input
                        type="text"
                        id="item-name"
                        className="w-100 input-box"
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-md-5 col-12">
            <div className="d-block m-auto px-2 py-3 bg-white sticky rounded">
              <div className="menu-item border-bottom">
                <span className="menu-icon">
                  <i className="fa-solid fa-floppy-disk"></i>
                </span>
                <span className="btn-menu-link">Save</span>
              </div>

              <div className="menu-item border-bottom">
                <span className="menu-icon">
                  <i className="fa-solid fa-xmark"></i>
                </span>
                <span className="btn-menu-link">Cancel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsertItem;
