import posConfig from "../../../config/posConfig";

const BranchSettings = () => {
  return (
    <div className="page">
      <h2 className="mb-3">Branch Settings</h2>
      <p className="text-secondary font-12 mb-4">
        Quick view of the branch values used across the POS. Tie this screen to
        your settings table when you are ready to persist changes.
      </p>

      <div className="card shadow-sm">
        <div className="card-body">
          <dl className="row mb-0">
            <dt className="col-sm-4">Branch name</dt>
            <dd className="col-sm-8">{posConfig.branchName}</dd>

            <dt className="col-sm-4">Default cashier</dt>
            <dd className="col-sm-8">{posConfig.cashierName}</dd>

            <dt className="col-sm-4">Default location ID</dt>
            <dd className="col-sm-8">{posConfig.defaultLocationId}</dd>

            <dt className="col-sm-4">Currency symbol</dt>
            <dd className="col-sm-8">{posConfig.currencySymbol}</dd>
          </dl>
        </div>
      </div>

      <div className="alert alert-info mt-3 mb-0" role="alert">
        Future improvement: add editable inputs and persist updates to the
        `pos_config` table.
      </div>
    </div>
  );
};

export default BranchSettings;
