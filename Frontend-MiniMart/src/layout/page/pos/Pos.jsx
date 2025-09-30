import "./pos.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PrintInvoice from "./PrintInvoice";
import { fetchProducts } from "../../../api/products";
import { createOrder } from "../../../api/orders";
import posConfig from "../../../config/posConfig";
import { useAuth } from "../../../context/AuthContext";

const {
  defaultLocationId: DEFAULT_LOCATION_ID,
  defaultUserId: DEFAULT_USER_ID,
  branchName: DEFAULT_BRANCH,
  cashierName: DEFAULT_CASHIER,
  currencySymbol: CURRENCY_SYMBOL,
  searchSuggestionLimit: SEARCH_SUGGESTION_LIMIT,
} = posConfig;

const buildProductLookup = (list) => {
  const lookup = {};
  list.forEach((product) => {
    if (!product) return;
    const sku = product.sku ?? product.barcode;
    if (sku) {
      lookup[sku.toLowerCase()] = product;
    }
    if (product.name) {
      lookup[product.name.toLowerCase()] = product;
    }
  });
  return lookup;
};

const getCategoryName = (product) => {
  if (!product) return "General";
  if (product.category && product.category.name) {
    return product.category.name;
  }
  if (product.categoryName) {
    return product.categoryName;
  }
  return "General";
};

const formatCurrency = (value) => {
  const amount = Number.isFinite(value) ? value : Number(value) || 0;
  return CURRENCY_SYMBOL + amount.toFixed(2);
};

const Pos = () => {
  const { user } = useAuth();
  const activeUserId = user?.userId ?? DEFAULT_USER_ID;
  const activeLocationId = user?.locationId ?? DEFAULT_LOCATION_ID;
  const activeLocationName = user?.locationName ?? DEFAULT_BRANCH;
  const activeCashierName = user?.username ?? DEFAULT_CASHIER;

  const [products, setProducts] = useState([]);
  const [productLookup, setProductLookup] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  const [cart, setCart] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [feedback, setFeedback] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [cashReceived, setCashReceived] = useState("");

  const [receiptData, setReceiptData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const hasSearchTerm = scanInput.trim().length > 0;

  const barcodeInputRef = useRef(null);

  const focusScanner = () => {
    barcodeInputRef.current?.focus();
  };

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchProducts({ signal: controller.signal });
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        setProductLookup(buildProductLookup(list));
        setProductError(null);
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        setProducts([]);
        setProductLookup({});
        setProductError(error.message || "Unable to load product catalog.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const categoryNames = useMemo(() => {
    const names = new Set();
    products.forEach((product) => {
      names.add(getCategoryName(product));
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const featuredCategories = useMemo(() => {
    return categoryNames.slice(0, 4);
  }, [categoryNames]);

  const [activeCategory, setActiveCategory] = useState("Featured");

  useEffect(() => {
    if (activeCategory === "Featured") return;
    if (!categoryNames.includes(activeCategory)) {
      setActiveCategory("Featured");
    }
  }, [categoryNames, activeCategory]);

  const categoryTabs = useMemo(() => {
    if (categoryNames.length === 0) {
      return ["Featured"];
    }
    return ["Featured", ...categoryNames];
  }, [categoryNames]);

  const quickProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }

    const filtered = products.filter((product) => {
      const category = getCategoryName(product);
      if (activeCategory === "Featured") {
        if (featuredCategories.length === 0) {
          return true;
        }
        return featuredCategories.includes(category);
      }
      return category === activeCategory;
    });

    return filtered.slice(0, 8);
  }, [products, activeCategory, featuredCategories]);

  const addProductToCart = (product, quantity = 1) => {
    const qty = Math.max(Math.floor(quantity), 1);
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.productId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, qty: item.qty + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.productId,
          name: product.name ?? "Unnamed product",
          price: Number(product.price) || 0,
          sku: product.sku ?? product.barcode ?? "N/A",
          qty,
        },
      ];
    });
  };

  const normalizeQuery = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";

  const resolveProduct = useCallback(
    (query) => {
      const normalized = normalizeQuery(query);
      if (!normalized) {
        return null;
      }

      const exactSku = products.find((item) => {
        const sku = item?.sku ?? item?.barcode;
        return typeof sku === "string" && sku.toLowerCase() === normalized;
      });
      if (exactSku) {
        return exactSku;
      }

      return productLookup[normalized] ?? null;
    },
    [productLookup, products]
  );

  const updateSearchMatches = useCallback(
    (value) => {
      const normalized = normalizeQuery(value);
      if (!normalized) {
        setSearchResults([]);
        return;
      }

      const matches = products.filter((product) => {
        const fields = [product?.sku, product?.barcode, product?.name];
        return fields.some((field) => {
          if (typeof field !== "string") return false;
          return field.toLowerCase().includes(normalized);
        });
      });

      setSearchResults(matches.slice(0, SEARCH_SUGGESTION_LIMIT));
    },
    [products]
  );

  useEffect(() => {
    updateSearchMatches(scanInput);
  }, [scanInput, updateSearchMatches]);

  const handleSelectProduct = (product) => {
    if (!product) return;
    setCheckoutError(null);
    addProductToCart(product, 1);
    setFeedback({
      type: "success",
      message: `${product.name ?? "Item"} added to cart`,
    });
    setScanInput("");
    setSearchResults([]);
    focusScanner();
  };

  const handleScanSubmit = (event) => {
    event.preventDefault();
    setCheckoutError(null);

    const query = scanInput.trim();
    if (!query) {
      setFeedback({ type: "warning", message: "Enter a SKU to add an item." });
      return;
    }

    const product = resolveProduct(query) ?? (searchResults.length === 1 ? searchResults[0] : null);
    if (!product) {
      setFeedback({
        type: "danger",
        message: `No product found for "${query}"`,
      });
      return;
    }

    handleSelectProduct(product);
  };

  const handleQuantityChange = (sku, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.sku === sku
            ? { ...item, qty: Math.max(item.qty + delta, 0) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleRemove = (sku) => {
    setCart((prev) => prev.filter((item) => item.sku !== sku));
  };

  const handleClear = () => {
    setCart([]);
    setCashReceived("");
    setScanInput("");
    setSearchResults([]);
    setCheckoutError(null);
    setFeedback({ type: "info", message: "Sale cleared" });
    focusScanner();
  };


  const subTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cart]);

  const qtyTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  const changeDue = useMemo(() => {
    const received = Number.parseFloat(cashReceived);
    if (!Number.isFinite(received)) return 0;
    return Math.max(received - subTotal, 0);
  }, [cashReceived, subTotal]);

  const cashShort = useMemo(() => {
    const received = Number.parseFloat(cashReceived);
    if (!Number.isFinite(received)) {
      return subTotal > 0;
    }
    return received + 1e-6 < subTotal;
  }, [cashReceived, subTotal]);

  const showEmptySearch = hasSearchTerm && searchResults.length === 0 && !loadingProducts;

  const handleCashShortcut = (value) => {
    if (value === "EXACT") {
      setCashReceived(subTotal.toFixed(2));
      return;
    }
    setCashReceived(Number(value).toFixed(2));
  };

  const canCheckout = cart.length > 0 && !cashShort && !saving;

  const handleCheckout = async () => {
    setCheckoutError(null);
    if (cart.length === 0) {
      setFeedback({ type: "warning", message: "Scan at least one item." });
      return;
    }

    const cashAmount = Number.parseFloat(cashReceived);
    if (!Number.isFinite(cashAmount) || cashAmount < subTotal) {
      setCheckoutError("Cash received is less than the total due.");
      return;
    }

    const orderPayload = {
      userId: activeUserId,
      customerId: null,
      locationId: activeLocationId,
      discount: 0,
      paymentStatus: "PAID",
      orderDetails: cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        price: item.price,
      })),
    };

    try {
      setSaving(true);
      const savedOrder = await createOrder(orderPayload);
      const orderId = savedOrder?.orderId;
      const orderNumber =
        orderId != null
          ? `INV-${String(orderId).padStart(5, "0")}`
          : `TEMP-${Date.now()}`;
      const orderDate = savedOrder?.orderDate ?? new Date().toISOString();

      setReceiptData({
        orderNumber,
        orderDate,
        cashier: activeCashierName,
        location: activeLocationName,
        items: cart.map((item) => ({
          sku: item.sku,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        totals: {
          subtotal: subTotal,
          discount: 0,
          total: subTotal,
          cashReceived: cashAmount,
          changeDue: cashAmount - subTotal,
        },
      });
      setCart([]);
      setCashReceived("");
      setScanInput("");
      setSearchResults([]);
      setShowReceipt(true);
      setFeedback({
        type: "success",
        message: "Sale completed. Receipt ready.",
      });
      focusScanner();
    } catch (error) {
      setCheckoutError(error.message || "Unable to complete sale.");
    } finally {
      setSaving(false);
    }
  };

  const closeReceipt = () => {
    setShowReceipt(false);
    setReceiptData(null);
    focusScanner();
  };

  return (
    <div className="pos-layout d-flex flex-column gap-3">
      <div className="card shadow-sm p-3">
        <form
          onSubmit={handleScanSubmit}
          className="pos-scan d-flex flex-column gap-3"
        >
          <div className="pos-scan-input">
            <label className="form-label text-secondary text-uppercase small mb-2">
              Scan SKU / type code
            </label>
            <div className="input-group input-group-lg sku-input-group">
              <span className="input-group-text bg-white">
                <i className="fa-solid fa-barcode"></i>
              </span>
              <input
                ref={barcodeInputRef}
                type="text"
                className="form-control sku-input"
                placeholder="Type SKU then press Enter"
                value={scanInput}
                onChange={(event) => setScanInput(event.target.value)}
                disabled={loadingProducts}
                autoFocus
              />
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loadingProducts}
              >
                Add Item
              </button>
            </div>
            {(searchResults.length > 0 || showEmptySearch) && (
              <div className="pos-search-results">
                {searchResults.length > 0 ? (
                  <>
                    <div className="pos-search-results__header text-secondary text-uppercase small">
                      Matching products
                    </div>
                    {searchResults.map((product, index) => (
                      <button
                        type="button"
                        key={product.productId ?? product.sku ?? product.name ?? index}
                        className="pos-search-results__item"
                        onClick={() => handleSelectProduct(product)}
                      >
                        <div className="pos-search-results__item-info">
                          <div className="fw-semibold">
                            {product.name ?? "Unnamed product"}
                          </div>
                          <div className="text-secondary small">
                            SKU: {product.sku ?? product.barcode ?? "N/A"}
                          </div>
                        </div>
                        <div className="pos-search-results__item-price">
                          {formatCurrency(Number(product.price) || 0)}
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="pos-search-results__empty text-secondary small">
                    No matching products. Check the SKU code.
                  </div>
                )}
              </div>
            )}
            {loadingProducts && (
              <div className="text-secondary small mt-2">
                Loading product catalog�
              </div>
            )}
            {productError && !loadingProducts && (
              <div
                className="alert alert-danger py-2 px-3 mt-3 mb-0"
                role="alert"
              >
                {productError}
              </div>
            )}
          </div>
          <div className="pos-tabs text-nowrap">
            {categoryTabs.map((category) => (
              <button
                key={category}
                type="button"
                className={`pos-tab btn btn-light btn-sm text-uppercase ${
                  category === activeCategory ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </form>
        {feedback && (
          <div
            className={`alert alert-${feedback.type} py-2 px-3 mt-3 mb-0`}
            role="alert"
          >
            {feedback.message}
          </div>
        )}
      </div>

      


      <div className="d-flex flex-column flex-xl-row gap-3">
        <div className="card shadow-sm flex-grow-1">
          <div className="card-header bg-white d-flex justify-content-between align-items-center">
            <div className="fw-semibold text-uppercase">Review Sale</div>
            <div className="text-secondary small">Items: {qtyTotal}</div>
          </div>
          <div className="table-responsive" style={{ maxHeight: "48vh" }}>
            <table className="table align-middle table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-secondary py-4">
                      Scan a product to start a sale.
                    </td>
                  </tr>
                )}
                {cart.map((item, index) => (
                  <tr key={item.sku}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-secondary small">
                        SKU: {item.sku}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.sku, -1)}
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="btn btn-light fw-semibold">
                          {item.qty}
                        </span>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => handleQuantityChange(item.sku, 1)}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </td>
                    <td className="text-end">{formatCurrency(item.price)}</td>
                    <td className="text-end">
                      {formatCurrency(item.price * item.qty)}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleRemove(item.sku)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {cart.length > 0 && (
            <div className="card-footer bg-white d-flex justify-content-between align-items-center">
              <button
                className="btn btn-link text-danger"
                onClick={handleClear}
              >
                <i className="fa-solid fa-xmark me-2"></i>Clear Sale
              </button>
              <div className="text-secondary small">
                Adjust quantities or remove items before checkout.
              </div>
            </div>
          )}
        </div>

        <div className="pos-summary card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2 text-secondary small">
              <span>Subtotal</span>
              <span>{formatCurrency(subTotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-secondary small">
              <span>Total Items</span>
              <span>{qtyTotal}</span>
            </div>
            <div className="mb-3">
              <label className="form-label text-secondary small">
                Cash Received
              </label>
              <div className="input-group input-group-sm">
                <span className="input-group-text">{CURRENCY_SYMBOL}</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  className="form-control"
                  value={cashReceived}
                  onChange={(event) => setCashReceived(event.target.value)}
                />
              </div>
              <div className="d-flex gap-2 mt-2">
                {["EXACT", 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleCashShortcut(preset)}
                  >
                    {preset === "EXACT" ? "Exact" : preset}
                  </button>
                ))}
              </div>
              <div className="text-secondary small mt-1">
                POS will calculate change automatically.
              </div>
            </div>

            <div className="d-flex justify-content-between text-secondary small mb-3">
              <span>Change Due</span>
              <span>{formatCurrency(changeDue)}</span>
            </div>

            {checkoutError && (
              <div className="alert alert-danger py-2" role="alert">
                {checkoutError}
              </div>
            )}

            {cashShort && cart.length > 0 && !checkoutError && (
              <div className="alert alert-warning py-2" role="alert">
                Cash received is less than the sale total.
              </div>
            )}

            <div className="d-grid gap-2">
              <button
                className="btn btn-success btn-lg text-uppercase fw-semibold"
                onClick={handleCheckout}
                disabled={!canCheckout}
              >
                {saving ? "Processing..." : "Checkout"}
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={cart.length === 0}
              >
                Put On Hold
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div className="fw-semibold text-uppercase">Quick Picks</div>
          <div className="text-secondary small">
            Tap to add items without typing the SKU
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3 g-lg-4 pos-quick-grid">
            {quickProducts.map((product) => (
              <div
                className="col-12 col-sm-6 col-lg-4 col-xxl-3"
                key={product.productId ?? product.sku}
              >
                <button
                  className="btn btn-light w-100 h-100 text-start pos-quick-btn"
                  onClick={() => handleSelectProduct(product)}
                >
                  <div className="fw-semibold">
                    {product.name ?? "Unnamed product"}
                  </div>
                  <div className="text-secondary small">
                    SKU: {product.sku ?? product.barcode ?? "N/A"}
                  </div>
                  <div className="fw-bold mt-2">
                    {formatCurrency(Number(product.price) || 0)}
                  </div>
                </button>
              </div>
            ))}
            {quickProducts.length === 0 && (
              <div className="col">
                <div className="alert alert-light mb-0">
                  No quick picks available yet.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pos-action-bar d-flex align-items-center justify-content-between px-3 py-2 mt-2">
        <div>
          <button className="btn btn-secondary btn-sm me-2">
            Options (F1)
          </button>
          <button
            className="btn btn-primary btn-sm me-2"
            onClick={focusScanner}
          >
            New (F2)
          </button>
          <button className="btn btn-warning btn-sm me-2" disabled>
            Hold (F3)
          </button>
          <button className="btn btn-success btn-sm" disabled>
            Recall (F4)
          </button>
        </div>
        <div className="small text-muted">
          Cashier: {activeCashierName} | Branch: {activeLocationName}
        </div>
      </div>

      {showReceipt && receiptData && (
        <div className="pos-receipt-modal">
          <div className="pos-receipt-backdrop" onClick={closeReceipt}></div>
          <div className="pos-receipt-dialog">
            <PrintInvoice
              preview
              receipt={receiptData}
              onClose={closeReceipt}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Pos;
