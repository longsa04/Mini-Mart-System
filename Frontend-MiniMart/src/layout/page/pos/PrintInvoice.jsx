import { useRef } from "react";
import PropTypes from "prop-types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import posConfig from "../../../config/posConfig";
// import posLogo from "../../../assets/pos-logo.svg";
import posLogo from "../../../assets/mini-mart.png";

const {
  currencySymbol: CURRENCY_SYMBOL,
  branchName: DEFAULT_BRANCH,
  cashierName: DEFAULT_CASHIER,
} = posConfig;

const formatCurrency = (value) => {
  const amount = Number.isFinite(value) ? value : Number(value) || 0;
  return CURRENCY_SYMBOL + amount.toFixed(2);
};

const ensureDate = (value) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const defaultReceipt = {
  orderNumber: "INV-000000",
  orderDate: new Date().toISOString(),
  cashier: DEFAULT_CASHIER,
  location: DEFAULT_BRANCH,
  items: [{ name: "Sample Item", sku: "SKU-001", qty: 1, price: 0 }],
  totals: {
    subtotal: 0,
    discount: 0,
    total: 0,
    cashReceived: 0,
    changeDue: 0,
  },
};

const PrintInvoice = ({ preview = false, receipt, onClose }) => {
  const invoiceRef = useRef(null);
  const data = receipt ?? defaultReceipt;
  const orderDate = ensureDate(data.orderDate);
  const items =
    Array.isArray(data.items) && data.items.length > 0
      ? data.items
      : defaultReceipt.items;
  const totals = {
    ...defaultReceipt.totals,
    ...(data.totals || {}),
  };

  const downloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    const clone = element.cloneNode(true);
    clone.classList.add("invoice-pdf");

    const sandbox = document.createElement("div");
    sandbox.style.position = "fixed";
    sandbox.style.top = "-10000px";
    sandbox.style.left = "0";
    sandbox.style.width = "148mm";
    sandbox.style.zIndex = "-1";
    sandbox.appendChild(clone);

    document.body.appendChild(sandbox);

    try {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      const scale = Math.min(3, window.devicePixelRatio || 2);

      const canvas = await html2canvas(clone, {
        scale,
        backgroundColor: "#ffffff",
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a5");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data.orderNumber ?? "receipt"}.pdf`);
      if (onClose) {
        onClose();
      }
    } finally {
      document.body.removeChild(sandbox);
    }
  };

  const invoiceStyle = {
    background: "#fff",
    width: preview ? "240px" : "80mm",
    minHeight: preview ? "210px" : "auto",
    padding: preview ? "12px 16px 16px" : "10mm",
    fontFamily: '"Inter", "Arial", sans-serif',
    border: preview ? "1px solid rgba(21, 30, 51, 0.12)" : "1px solid #eee",
    fontSize: preview ? "10.2px" : "7px",
    lineHeight: preview ? "1.38" : "1.4",
    borderRadius: preview ? "14px" : "6px",
    boxShadow: preview ? "0 12px 24px rgba(15, 23, 42, 0.15)" : "none",
  };

  return (
    <div className={preview ? "print-preview-container" : ""}>
      <div
        className={
          preview
            ? "print-preview-toolbar d-flex align-items-center justify-content-between"
            : "mb-2 d-flex justify-content-end"
        }
      >
        {preview && (
          <span className="text-muted small">Thermal receipt preview</span>
        )}
        <div className="d-flex align-items-center gap-2">
          {preview && onClose && (
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm px-3"
              onClick={onClose}
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={downloadPDF}
            className="btn btn-primary btn-sm px-3"
          >
            Print Receipt
          </button>
        </div>
      </div>

      <div className={preview ? "print-preview-stage" : ""}>
        <div className={preview ? "print-preview-paper" : ""}>
          <div ref={invoiceRef} className="invoice" style={invoiceStyle}>
            <header className="d-flex justify-content-between align-items-start mb-3">
              <div className="text-center w-25">
                <div className="preview-logo mx-auto">
                  <img src={posLogo} alt="Brand logo" className="img-fluid" />
                </div>
              </div>
              <div className="text-end text-secondary small">
                <div>
                  Invoice No:{" "}
                  <strong className="text-dark">{data.orderNumber}</strong>
                </div>
                <div>
                  Date:{" "}
                  <strong className="text-dark">
                    {orderDate.toLocaleDateString()}
                  </strong>
                </div>
                <div>
                  Time:{" "}
                  <strong className="text-dark">
                    {orderDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </div>
              </div>
            </header>

            <div className="d-flex justify-content-between text-secondary small mb-3">
              <div>
                <p className="mb-1 text-uppercase fw-semibold text-dark">
                  {data.location ?? DEFAULT_BRANCH}
                </p>
                <p className="mb-1">Staff: {data.cashier ?? DEFAULT_CASHIER}</p>
                <p className="mb-1">
                  Branch: {data.location ?? DEFAULT_BRANCH}
                </p>
                <p className="mb-0">Thanks for shopping with us!</p>
              </div>
              <div className="text-end">
                <p className="mb-1">email: sales@pos.com</p>
                <p className="mb-1">phone: 088 905 8825</p>
                <p className="mb-0">GST: FM-203955</p>
              </div>
            </div>

            <div className="invoice-divider" aria-hidden="true" />

            <table className="w-100 invoice-table mb-3">
              <thead>
                <tr>
                  <th className="text-start">Item</th>
                  <th className="text-end">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const lineAmount =
                    (Number(item.price) || 0) * (Number(item.qty) || 0);
                  return (
                    <tr key={item.sku ?? item.name ?? index}>
                      <td>
                        <div className="fw-semibold text-dark">
                          {item.name ?? "Item"}
                        </div>
                      </td>
                      <td className="text-end">{item.qty}</td>
                      <td className="text-end">{formatCurrency(item.price)}</td>
                      <td className="text-end">{formatCurrency(lineAmount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div
              className="invoice-divider invoice-divider--light"
              aria-hidden="true"
            />

            <div className="text-end">
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Subtotal</span>
                <span className="text-dark fw-semibold">
                  {formatCurrency(totals.subtotal)}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Discount</span>
                <span className="text-dark fw-semibold">
                  {formatCurrency(totals.discount)}
                </span>
              </div>
              <div className="d-flex justify-content-between align-items-center invoice-total">
                <span className="text-uppercase fw-semibold">Total Due</span>
                <span className="fs-5 fw-bold text-dark">
                  {formatCurrency(totals.total)}
                </span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Cash Received</span>
                <span>{formatCurrency(totals.cashReceived)}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary">
                <span>Change</span>
                <span>{formatCurrency(totals.changeDue)}</span>
              </div>
            </div>

            <div
              className="invoice-divider invoice-divider--perforated"
              aria-hidden="true"
            />

            <div className="d-flex justify-content-between mt-3 text-secondary small">
              <div>
                <p className="mb-1 text-dark fw-semibold text-uppercase">
                  Payment Method
                </p>
                <p className="mb-0">Cash</p>
              </div>
              <div className="text-end">
                <p className="mb-1 text-dark fw-semibold text-uppercase">
                  Served By
                </p>
                <p className="mb-0">{data.cashier ?? "POS"}</p>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="fw-semibold text-dark mb-1">
                Thank you for shopping with us!
              </p>
              <p className="text-secondary small mb-0">
                Keep this receipt for your records.
              </p>
              <div
                className="invoice-barcode mt-3"
                aria-label="E-receipt barcode"
              >
                {data.orderNumber?.replace(/[^A-Z0-9]/gi, "").padEnd(20, "#")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PrintInvoice.propTypes = {
  preview: PropTypes.bool,
  receipt: PropTypes.shape({
    orderNumber: PropTypes.string,
    orderDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    cashier: PropTypes.string,
    location: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        sku: PropTypes.string,
        qty: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      })
    ),
    totals: PropTypes.shape({
      subtotal: PropTypes.number,
      discount: PropTypes.number,
      total: PropTypes.number,
      cashReceived: PropTypes.number,
      changeDue: PropTypes.number,
    }),
  }),
  onClose: PropTypes.func,
};

export default PrintInvoice;

