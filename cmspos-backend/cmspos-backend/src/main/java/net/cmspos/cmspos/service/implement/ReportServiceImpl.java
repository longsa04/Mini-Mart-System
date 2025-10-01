package net.cmspos.cmspos.service.implement;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.BadRequestException;
import net.cmspos.cmspos.model.dto.report.DailySalesSummaryDto;
import net.cmspos.cmspos.model.dto.report.InventoryItemDto;
import net.cmspos.cmspos.model.dto.report.InventoryReportDto;
import net.cmspos.cmspos.model.dto.report.ExpenseSummaryDto;
import net.cmspos.cmspos.model.dto.report.ProfitLossProductDto;
import net.cmspos.cmspos.model.dto.report.ProfitLossReportDto;
import net.cmspos.cmspos.model.dto.report.TopProductSalesDto;
import net.cmspos.cmspos.model.entity.Expense;
import net.cmspos.cmspos.model.entity.Product;
import net.cmspos.cmspos.model.entity.inventory.Stock;
import net.cmspos.cmspos.model.entity.order.Order;
import net.cmspos.cmspos.model.entity.order.OrderDetail;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrder;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrderDetail;
import net.cmspos.cmspos.model.enums.ExpenseCategory;
import net.cmspos.cmspos.model.enums.PaymentStatus;
import net.cmspos.cmspos.repository.ExpenseRepository;
import net.cmspos.cmspos.repository.ProductRepository;
import net.cmspos.cmspos.repository.inventory.StockRepository;
import net.cmspos.cmspos.repository.order.OrderDetailRepository;
import net.cmspos.cmspos.repository.order.OrderRepository;
import net.cmspos.cmspos.repository.purchase.PurchaseOrderRepository;
import net.cmspos.cmspos.service.ReportService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private static final int DEFAULT_TOP_PRODUCT_LIMIT = 5;

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final ExpenseRepository expenseRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    @Override
    public List<DailySalesSummaryDto> getDailySalesSummary(LocalDate startDate, LocalDate endDate, Long locationId) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusDays(6));

        if (effectiveEnd.isBefore(effectiveStart)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        LocalDateTime rangeStart = effectiveStart.atStartOfDay();
        LocalDateTime rangeEnd = effectiveEnd.plusDays(1).atStartOfDay();

        List<Order> orders = locationId == null
                ? orderRepository.findByPaymentStatusAndOrderDateBetween(PaymentStatus.PAID, rangeStart, rangeEnd)
                : orderRepository.findByPaymentStatusAndLocation_LocationIdAndOrderDateBetween(
                        PaymentStatus.PAID, locationId, rangeStart, rangeEnd);

        Map<LocalDate, DailyAccumulator> accumulatorMap = new LinkedHashMap<>();
        LocalDate cursor = effectiveStart;
        while (!cursor.isAfter(effectiveEnd)) {
            accumulatorMap.put(cursor, new DailyAccumulator());
            cursor = cursor.plusDays(1);
        }

        for (Order order : orders) {
            if (order.getOrderDate() == null) {
                continue;
            }
            LocalDate orderDay = order.getOrderDate().toLocalDate();
            DailyAccumulator accumulator = accumulatorMap.get(orderDay);
            if (accumulator == null) {
                continue;
            }
            accumulator.totalSales += Optional.ofNullable(order.getTotal()).orElse(0.0);
            accumulator.orderCount += 1;
        }

        return accumulatorMap.entrySet().stream()
                .map(entry -> {
                    LocalDate date = entry.getKey();
                    DailyAccumulator value = entry.getValue();
                    double average = value.orderCount == 0 ? 0.0 : value.totalSales / value.orderCount;
                    return DailySalesSummaryDto.builder()
                            .date(date)
                            .totalSales(round(value.totalSales))
                            .totalTax(0.0)
                            .orderCount(value.orderCount)
                            .averageOrderValue(round(average))
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<TopProductSalesDto> getTopProducts(LocalDate startDate, LocalDate endDate, int limit, Long locationId) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusMonths(1));

        if (effectiveEnd.isBefore(effectiveStart)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        int maxResults = limit > 0 ? limit : DEFAULT_TOP_PRODUCT_LIMIT;

        LocalDateTime rangeStart = effectiveStart.atStartOfDay();
        LocalDateTime rangeEnd = effectiveEnd.plusDays(1).atStartOfDay();

        List<OrderDetail> details = locationId == null
                ? orderDetailRepository.findByOrder_PaymentStatusAndOrder_OrderDateBetween(PaymentStatus.PAID, rangeStart, rangeEnd)
                : orderDetailRepository.findByOrder_PaymentStatusAndOrder_Location_LocationIdAndOrder_OrderDateBetween(
                        PaymentStatus.PAID, locationId, rangeStart, rangeEnd);

        Map<Long, ProductAccumulator> productSales = new HashMap<>();
        for (OrderDetail detail : details) {
            if (detail.getProduct() == null) {
                continue;
            }
            Long productId = detail.getProduct().getProductId();
            if (productId == null) {
                continue;
            }
            ProductAccumulator accumulator = productSales.computeIfAbsent(
                    productId, id -> new ProductAccumulator(detail.getProduct().getName()));
            int quantity = Optional.ofNullable(detail.getQuantity()).orElse(0);
            double unitPrice = Optional.ofNullable(detail.getPrice()).orElse(0.0);
            accumulator.quantity += quantity;
            accumulator.totalSales += unitPrice * quantity;
        }

        return productSales.entrySet().stream()
                .map(entry -> TopProductSalesDto.builder()
                        .productId(entry.getKey())
                        .productName(entry.getValue().productName)
                        .quantitySold(entry.getValue().quantity)
                        .totalSales(round(entry.getValue().totalSales))
                        .build())
                .sorted(Comparator
                        .comparingLong(TopProductSalesDto::getQuantitySold).reversed()
                        .thenComparing(Comparator.comparingDouble(TopProductSalesDto::getTotalSales).reversed())
                        .thenComparing(TopProductSalesDto::getProductName))
                .limit(maxResults)
                .collect(Collectors.toList());
    }

    @Override
    public InventoryReportDto getInventoryReport() {
        List<Stock> stocks = stockRepository.findAll();

        Map<Long, InventoryAccumulator> inventoryByProduct = new HashMap<>();
        for (Stock stock : stocks) {
            Product product = stock.getProduct();
            if (product == null) {
                continue;
            }
            InventoryAccumulator accumulator = inventoryByProduct.computeIfAbsent(
                    product.getProductId(), id -> new InventoryAccumulator(product));
            accumulator.quantity += Optional.ofNullable(stock.getQuantity()).orElse(0);
        }

        List<InventoryItemDto> items = inventoryByProduct.values().stream()
                .map(accumulator -> {
                    double unitPrice = Optional.ofNullable(accumulator.product.getPrice()).orElse(0.0);
                    double value = unitPrice * accumulator.quantity;
                    return InventoryItemDto.builder()
                            .productId(accumulator.product.getProductId())
                            .productName(accumulator.product.getName())
                            .stockQuantity(Math.toIntExact(accumulator.quantity))
                            .unitPrice(round(unitPrice))
                            .stockValue(round(value))
                            .build();
                })
                .sorted(Comparator
                        .comparingDouble(InventoryItemDto::getStockValue).reversed()
                        .thenComparing(InventoryItemDto::getProductName))
                .collect(Collectors.toList());

        double totalValue = items.stream()
                .mapToDouble(InventoryItemDto::getStockValue)
                .sum();

        return InventoryReportDto.builder()
                .totalInventoryValue(round(totalValue))
                .items(items)
                .build();
    }

    @Override
    public ProfitLossReportDto getProfitAndLoss(LocalDate startDate, LocalDate endDate, Long locationId) {
        LocalDate effectiveEnd = Optional.ofNullable(endDate).orElse(LocalDate.now());
        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(effectiveEnd.minusMonths(1));

        if (effectiveEnd.isBefore(effectiveStart)) {
            throw new BadRequestException("End date cannot be before start date");
        }

        LocalDateTime rangeStart = effectiveStart.atStartOfDay();
        LocalDateTime rangeEnd = effectiveEnd.plusDays(1).atStartOfDay();

        List<Order> paidOrders = locationId == null
                ? orderRepository.findByPaymentStatusAndOrderDateBetween(PaymentStatus.PAID, rangeStart, rangeEnd)
                : orderRepository.findByPaymentStatusAndLocation_LocationIdAndOrderDateBetween(
                        PaymentStatus.PAID, locationId, rangeStart, rangeEnd);

        double totalRevenue = paidOrders.stream()
                .mapToDouble(order -> Optional.ofNullable(order.getTotal()).orElse(0.0))
                .sum();

        double totalDiscounts = paidOrders.stream()
                .mapToDouble(order -> Optional.ofNullable(order.getDiscount()).orElse(0.0))
                .sum();

        List<OrderDetail> orderDetails = locationId == null
                ? orderDetailRepository.findByOrder_PaymentStatusAndOrder_OrderDateBetween(
                        PaymentStatus.PAID, rangeStart, rangeEnd)
                : orderDetailRepository.findByOrder_PaymentStatusAndOrder_Location_LocationIdAndOrder_OrderDateBetween(
                        PaymentStatus.PAID, locationId, rangeStart, rangeEnd);

        Map<Long, SalesAccumulator> salesByProduct = new HashMap<>();
        for (OrderDetail detail : orderDetails) {
            if (detail.getProduct() == null) {
                continue;
            }
            Long productId = detail.getProduct().getProductId();
            if (productId == null) {
                continue;
            }
            SalesAccumulator accumulator = salesByProduct.computeIfAbsent(
                    productId, id -> new SalesAccumulator(detail.getProduct().getName()));
            int quantity = Optional.ofNullable(detail.getQuantity()).orElse(0);
            double unitPrice = Optional.ofNullable(detail.getPrice()).orElse(0.0);
            accumulator.quantity += quantity;
            accumulator.revenue += unitPrice * quantity;
            double unitCostPrice = Optional.ofNullable(detail.getProduct().getCostPrice()).orElse(0.0);
            if (unitCostPrice > 0.0 || accumulator.costPrice == 0.0) {
                accumulator.costPrice = unitCostPrice;
            }
        }

        Map<Long, CostAccumulator> costByProduct = new HashMap<>();
        List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByOrderDateLessThanEqual(rangeEnd);
        for (PurchaseOrder purchaseOrder : purchaseOrders) {
            if (locationId != null) {
                if (purchaseOrder.getLocation() == null
                        || !locationId.equals(purchaseOrder.getLocation().getLocationId())) {
                    continue;
                }
            }
            List<PurchaseOrderDetail> details = Optional.ofNullable(purchaseOrder.getDetails()).orElse(List.of());
            for (PurchaseOrderDetail detail : details) {
                if (detail.getProduct() == null || detail.getProduct().getProductId() == null) {
                    continue;
                }
                CostAccumulator accumulator = costByProduct.computeIfAbsent(
                        detail.getProduct().getProductId(), id -> new CostAccumulator());
                int quantity = Optional.ofNullable(detail.getQuantity()).orElse(0);
                double cost = Optional.ofNullable(detail.getPrice()).orElse(0.0);
                accumulator.quantity += quantity;
                accumulator.totalCost += cost * quantity;
            }
        }

        double costOfGoodsSoldValue = 0.0;
        List<ProfitLossProductDto> productBreakdown = new ArrayList<>();
        for (Map.Entry<Long, SalesAccumulator> entry : salesByProduct.entrySet()) {
            Long productId = entry.getKey();
            SalesAccumulator sales = entry.getValue();
            CostAccumulator cost = costByProduct.get(productId);
            double averageCost = (cost == null || cost.quantity == 0)
                    ? sales.costPrice
                    : cost.totalCost / cost.quantity;
            double productCost = averageCost * sales.quantity;
            double grossProfit = sales.revenue - productCost;
            costOfGoodsSoldValue += productCost;
            productBreakdown.add(ProfitLossProductDto.builder()
                    .productId(productId)
                    .productName(sales.productName)
                    .quantitySold(sales.quantity)
                    .revenue(round(sales.revenue))
                    .costOfGoods(round(productCost))
                    .grossProfit(round(grossProfit))
                    .build());
        }

        productBreakdown.sort(Comparator
                .comparingDouble(ProfitLossProductDto::getRevenue).reversed()
                .thenComparing(ProfitLossProductDto::getProductName));

        List<Expense> expenses = expenseRepository.findByExpenseDateBetween(rangeStart, rangeEnd);
        Map<ExpenseCategory, Double> expenseTotals = new HashMap<>();
        for (Expense expense : expenses) {
            if (locationId != null) {
                if (expense.getLocation() == null
                        || !locationId.equals(expense.getLocation().getLocationId())) {
                    continue;
                }
            }
            ExpenseCategory category = Optional.ofNullable(expense.getCategory()).orElse(ExpenseCategory.OTHER);
            double amount = Optional.ofNullable(expense.getAmount()).orElse(0.0);
            expenseTotals.merge(category, amount, Double::sum);
        }

        double totalExpensesValue = expenseTotals.values().stream()
                .mapToDouble(Double::doubleValue)
                .sum();

        List<ExpenseSummaryDto> expenseBreakdown = expenseTotals.entrySet().stream()
                .map(entry -> ExpenseSummaryDto.builder()
                        .category(entry.getKey())
                        .totalAmount(round(entry.getValue()))
                        .build())
                .sorted(Comparator
                        .comparingDouble(ExpenseSummaryDto::getTotalAmount).reversed()
                        .thenComparing(expenseSummaryDto -> expenseSummaryDto.getCategory().name()))
                .toList();

        double grossProfit = totalRevenue - costOfGoodsSoldValue;
        double netProfit = grossProfit - totalExpensesValue;

        return ProfitLossReportDto.builder()
                .startDate(effectiveStart)
                .endDate(effectiveEnd)
                .totalRevenue(round(totalRevenue))
                .totalDiscounts(round(totalDiscounts))
                .costOfGoodsSold(round(costOfGoodsSoldValue))
                .grossProfit(round(grossProfit))
                .totalExpenses(round(totalExpensesValue))
                .netProfit(round(netProfit))
                .productBreakdown(productBreakdown)
                .expenseBreakdown(expenseBreakdown)
                .build();
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private static class DailyAccumulator {
        private double totalSales;
        private long orderCount;
    }

    private static class ProductAccumulator {
        private final String productName;
        private long quantity;
        private double totalSales;

        private ProductAccumulator(String productName) {
            this.productName = productName;
        }
    }

    private static class InventoryAccumulator {
        private final Product product;
        private long quantity;

        private InventoryAccumulator(Product product) {
            this.product = product;
        }
    }

    private static class SalesAccumulator {
        private final String productName;
        private long quantity;
        private double revenue;
        private double costPrice;

        private SalesAccumulator(String productName) {
            this.productName = productName;
        }
    }

    private static class CostAccumulator {
        private long quantity;
        private double totalCost;
    }
}
