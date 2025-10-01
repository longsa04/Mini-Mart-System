-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Sep 30, 2025 at 03:19 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pos`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
CREATE TABLE IF NOT EXISTS `activity_log` (
  `log_id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(255) NOT NULL,
  `log_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`log_id`),
  KEY `fk_activity_log_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `activity_log`
--

INSERT INTO `activity_log` (`log_id`, `action`, `log_date`, `user_id`) VALUES
(1, 'Created new category', '2025-09-21 17:49:54', 1),
(2, 'Processed Order #1', '2025-09-21 17:49:54', 2),
(3, 'Updated stock for product #5', '2025-09-21 17:49:54', 3);

-- --------------------------------------------------------

--
-- Table structure for table `cash_register`
--

DROP TABLE IF EXISTS `cash_register`;
CREATE TABLE IF NOT EXISTS `cash_register` (
  `register_id` bigint NOT NULL AUTO_INCREMENT,
  `closing_balance` double DEFAULT NULL,
  `opening_balance` double NOT NULL,
  `register_date` date NOT NULL,
  `shift` enum('AFTERNOON','EVENING','MORNING') NOT NULL,
  `location_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`register_id`),
  KEY `fk_cash_register_location` (`location_id`),
  KEY `fk_cash_register_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cash_register`
--

INSERT INTO `cash_register` (`register_id`, `closing_balance`, `opening_balance`, `register_date`, `shift`, `location_id`, `user_id`) VALUES
(1, 500, 200, '0000-00-00', 'MORNING', 1, 2),
(2, 300, 150, '0000-00-00', 'EVENING', 2, 3);

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
CREATE TABLE IF NOT EXISTS `category` (
  `category_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `UK46ccwnsi9409t36lurvtyljak` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`category_id`, `name`) VALUES
(6, 'Bakery'),
(1, 'Beverages'),
(7, 'Dairy'),
(10, 'Electronics & Accessories'),
(5, 'Frozen Foods'),
(9, 'Health & Wellness'),
(3, 'Household'),
(4, 'Personal Care'),
(8, 'Produce'),
(2, 'Snacks');

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
CREATE TABLE IF NOT EXISTS `customer` (
  `customer_id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `points` int NOT NULL,
  PRIMARY KEY (`customer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`customer_id`, `email`, `name`, `phone`, `points`) VALUES
(1, 'john@example.com', 'John Doe', '012111111', 50),
(2, 'jane@example.com', 'Jane Smith', '012222222', 20),
(3, 'mike@example.com', 'Mike Chan', '012333333', 10);

-- --------------------------------------------------------

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
CREATE TABLE IF NOT EXISTS `expense` (
  `expense_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `category` enum('OTHER','RENT','SALARY','SUPPLIES','UTILITIES') NOT NULL DEFAULT 'OTHER',
  `description` varchar(255) NOT NULL,
  `expense_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `location_id` bigint NOT NULL,
  `user_id` bigint DEFAULT NULL,
  PRIMARY KEY (`expense_id`),
  KEY `fk_expense_location` (`location_id`),
  KEY `fk_expense_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `expense`
--

INSERT INTO `expense` (`expense_id`, `amount`, `category`, `description`, `expense_date`, `location_id`, `user_id`) VALUES
(1, 100, 'UTILITIES', 'Electricity Bill', '2025-09-21 17:49:54', 1, 1),
(2, 50, 'SUPPLIES', 'Cleaning Service', '2025-09-21 17:49:54', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
CREATE TABLE IF NOT EXISTS `location` (
  `location_id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`location_id`, `address`, `name`) VALUES
(1, '123 Main St, Phnom Penh', 'Chbar Ampov'),
(2, 'Airport Road, Phnom Penh', 'Daun Penh'),
(3, 'Aeon Mall, Phnom Penh', 'Toul Kork');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` bigint NOT NULL AUTO_INCREMENT,
  `discount` double NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `payment_status` enum('CANCELLED','PAID','PENDING') NOT NULL,
  `total` double NOT NULL,
  `customer_id` bigint DEFAULT NULL,
  `location_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`order_id`),
  KEY `fk_orders_customer` (`customer_id`),
  KEY `fk_orders_location` (`location_id`),
  KEY `fk_orders_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `discount`, `order_date`, `payment_status`, `total`, `customer_id`, `location_id`, `user_id`) VALUES
(1, 0, '2025-09-21 17:49:54', 'PAID', 10, 1, 1, 2),
(2, 0.5, '2025-09-21 17:49:54', 'PAID', 8, 2, 1, 2),
(3, 0, '2025-09-21 17:49:54', 'PENDING', 5, 3, 2, 3),
(4, 0, '2025-09-25 08:27:34', 'PAID', 4.3, NULL, 1, 1),
(6, 0, '2025-09-25 12:18:31', 'PAID', 3, NULL, 1, 1),
(7, 0, '2025-09-25 12:25:14', 'PAID', 4.2, NULL, 1, 1),
(8, 0, '2025-09-25 12:42:25', 'PAID', 2.8, NULL, 1, 1),
(9, 0, '2025-09-25 12:42:34', 'PAID', 2.8, NULL, 1, 1),
(10, 0, '2025-09-25 13:01:08', 'PAID', 1.4, NULL, 1, 1),
(11, 0, '2025-09-25 15:50:42', 'PAID', 1.4, NULL, 1, 1),
(12, 0, '2025-09-25 15:55:48', 'PAID', 1.5, NULL, 1, 1),
(13, 0, '2025-09-25 16:56:38', 'PAID', 1.5, NULL, 1, 2),
(14, 0, '2025-09-25 17:00:37', 'PAID', 1.4, NULL, 1, 2),
(15, 0, '2025-09-25 17:04:22', 'PAID', 1.4, NULL, 1, 2),
(16, 0, '2025-09-25 17:04:45', 'PAID', 1.5, NULL, 1, 2),
(21, 0, '2025-09-26 03:27:22', 'PAID', 8.4, NULL, 1, 2),
(22, 0, '2025-09-26 03:47:35', 'PAID', 3.6, NULL, 1, 2),
(23, 0, '2025-09-26 07:48:02', 'PAID', 3, NULL, 1, 2),
(24, 0, '2025-09-26 08:33:03', 'PAID', 1.5, NULL, 1, 2),
(25, 0, '2025-09-26 16:22:43', 'PAID', 1.4, NULL, 1, 2),
(27, 0, '2025-09-28 03:31:45', 'PAID', 1.5, NULL, 1, 2),
(29, 0, '2025-09-28 04:10:08', 'PAID', 5, NULL, 1, 1),
(30, 0, '2025-09-30 14:40:20', 'PAID', 14, NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `order_detail`
--

DROP TABLE IF EXISTS `order_detail`;
CREATE TABLE IF NOT EXISTS `order_detail` (
  `order_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `order_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `fk_orderdetail_order` (`order_id`),
  KEY `fk_orderdetail_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_detail`
--

INSERT INTO `order_detail` (`order_detail_id`, `price`, `quantity`, `order_id`, `product_id`) VALUES
(1, 3, 2, 1, 1),
(2, 2, 1, 1, 3),
(3, 2.8, 2, 2, 2),
(4, 4.5, 1, 3, 5),
(5, 1.5, 1, 4, 1),
(6, 1.4, 2, 4, 2),
(9, 1.5, 2, 6, 1),
(10, 2.1, 2, 7, 13),
(11, 1.4, 2, 8, 2),
(12, 1.4, 2, 9, 2),
(13, 1.4, 1, 10, 2),
(14, 1.4, 1, 11, 2),
(15, 1.5, 1, 12, 1),
(16, 1.5, 1, 13, 1),
(17, 1.4, 1, 14, 2),
(18, 1.4, 1, 15, 2),
(19, 1.5, 1, 16, 1),
(24, 1.4, 3, 21, 2),
(25, 2.1, 2, 21, 13),
(26, 2.1, 1, 22, 13),
(27, 1.5, 1, 22, 1),
(28, 1.5, 2, 23, 1),
(29, 1.5, 1, 24, 1),
(30, 1.4, 1, 25, 2),
(32, 1.5, 1, 27, 1),
(34, 5, 1, 29, 4),
(35, 1.4, 10, 30, 2);

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
CREATE TABLE IF NOT EXISTS `payment` (
  `payment_id` bigint NOT NULL AUTO_INCREMENT,
  `amount` double NOT NULL,
  `change_amount` double DEFAULT NULL,
  `method` enum('CARD','CASH','EWALLET','TRANSFER') NOT NULL,
  `paid_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `received_amount` double DEFAULT NULL,
  `order_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `fk_payment_order` (`order_id`),
  KEY `fk_payment_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`payment_id`, `amount`, `change_amount`, `method`, `paid_at`, `received_amount`, `order_id`, `user_id`) VALUES
(1, 10, 0, 'CASH', '2025-09-21 17:49:54', 10, 1, 2),
(2, 7.5, 0, 'CARD', '2025-09-21 17:49:54', 7.5, 2, 2);

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
CREATE TABLE IF NOT EXISTS `product` (
  `product_id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `price` double NOT NULL,
  `cost_price` double NOT NULL DEFAULT '0',
  `sku` varchar(50) DEFAULT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE KEY `UKq1mafxn973ldq80m1irp3mpvq` (`sku`),
  KEY `fk_product_category` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`product_id`, `name`, `price`, `cost_price`, `sku`, `category_id`) VALUES
(1, 'Coca Cola', 1.5, 0.95, 'SKU-COKE-001', 1),
(2, 'Pepsi', 1.4, 0.9, 'SKU-PEPSI-002', 1),
(3, 'Potato Chips', 2, 1.25, 'SKU-CHIP-003', 2),
(4, 'Laundry Powder', 5, 3.2, 'SKU-LAUN-004', 3),
(5, 'Shampoo', 4.5, 2.75, 'SKU-SHAM-005', 4),
(6, 'Frozen Pepperoni Pizza', 7.99, 5.1, 'SKU-FPIZ-006', 5),
(7, 'Mixed Vegetables (Frozen)', 3.49, 2.15, 'SKU-MVEG-007', 5),
(8, 'Whole Wheat Bread', 2.59, 1.35, 'SKU-WBREAD-008', 6),
(9, 'Chocolate Croissant', 1.99, 1.1, 'SKU-CCROIS-009', 6),
(10, 'Whole Milk 1L', 1.79, 1.05, 'SKU-WMILK-010', 7),
(11, 'Cheddar Cheese Block', 4.25, 2.85, 'SKU-CHED-011', 7),
(12, 'Fresh Lettuce', 1.35, 0.75, 'SKU-FLETT-012', 8),
(13, 'Bananas (1kg)', 2.1, 1.25, 'SKU-BAN-013', 8),
(14, 'Vitamin C Tablets', 8.95, 5.4, 'SKU-VITC-014', 9),
(15, 'Pain Relief Gel', 5.49, 3.3, 'SKU-PRGEL-015', 9),
(16, 'Wireless Mouse', 14.99, 9.2, 'SKU-WMOU-016', 10),
(17, 'USB-C Charging Cable', 6.5, 3.8, 'SKU-USBC-017', 10);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order`
--

DROP TABLE IF EXISTS `purchase_order`;
CREATE TABLE IF NOT EXISTS `purchase_order` (
  `po_id` bigint NOT NULL AUTO_INCREMENT,
  `order_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `total` double NOT NULL,
  `location_id` bigint DEFAULT NULL,
  `supplier_id` bigint DEFAULT NULL,
  PRIMARY KEY (`po_id`),
  KEY `fk_purchase_order_location` (`location_id`),
  KEY `fk_purchase_order_supplier` (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchase_order`
--

INSERT INTO `purchase_order` (`po_id`, `order_date`, `total`, `location_id`, `supplier_id`) VALUES
(1, '2025-09-21 17:49:54', 200, 1, 1),
(2, '2025-09-21 17:49:54', 150, 2, 2),
(3, '2025-09-25 17:00:00', 69, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order_detail`
--

DROP TABLE IF EXISTS `purchase_order_detail`;
CREATE TABLE IF NOT EXISTS `purchase_order_detail` (
  `purchase_order_detail_id` bigint NOT NULL AUTO_INCREMENT,
  `price` double NOT NULL,
  `quantity` int NOT NULL,
  `product_id` bigint NOT NULL,
  `po_id` bigint NOT NULL,
  PRIMARY KEY (`purchase_order_detail_id`),
  KEY `fk_purchase_order_detail_product` (`product_id`),
  KEY `fk_purchase_order_detail_order` (`po_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `purchase_order_detail`
--

INSERT INTO `purchase_order_detail` (`purchase_order_detail_id`, `price`, `quantity`, `product_id`, `po_id`) VALUES
(1, 1.4, 50, 1, 1),
(2, 1.3, 40, 2, 1),
(3, 1.8, 30, 3, 2),
(4, 2.3, 30, 10, 3);

-- --------------------------------------------------------

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
CREATE TABLE IF NOT EXISTS `stock` (
  `stock_id` bigint NOT NULL AUTO_INCREMENT,
  `last_updated` datetime(6) NOT NULL,
  `quantity` int NOT NULL,
  `location_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`stock_id`),
  UNIQUE KEY `uk_stock_product_location` (`product_id`,`location_id`),
  KEY `fk_stock_location` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock`
--

INSERT INTO `stock` (`stock_id`, `last_updated`, `quantity`, `location_id`, `product_id`) VALUES
(1, '2025-09-28 10:31:45.620277', 89, 1, 1),
(2, '2025-09-30 21:40:20.205313', 56, 1, 2),
(3, '2025-09-19 15:08:19.000000', 50, 2, 3),
(4, '2025-09-19 15:08:23.000000', 30, 3, 4),
(5, '2025-09-19 15:08:27.000000', 40, 1, 5),
(6, '2025-09-25 15:09:41.885454', 30, 1, 3),
(7, '2025-09-28 11:10:08.179969', 29, 1, 4),
(8, '2025-09-26 10:47:35.066079', 25, 1, 13),
(9, '2025-09-26 23:10:26.743200', 30, 1, 10),
(10, '2025-09-28 11:07:34.563008', 30, 1, 6),
(11, '2025-09-28 11:07:49.746256', 30, 1, 7),
(12, '2025-09-30 22:18:57.020494', 30, 1, 8);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movement`
--

DROP TABLE IF EXISTS `stock_movement`;
CREATE TABLE IF NOT EXISTS `stock_movement` (
  `stock_movement_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `movement_type` enum('ADJUSTMENT','PURCHASE','RECEIVE','RETURN','SALE','TRANSFER') NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `quantity_change` int NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `location_id` bigint DEFAULT NULL,
  `order_id` bigint DEFAULT NULL,
  `product_id` bigint NOT NULL,
  PRIMARY KEY (`stock_movement_id`),
  KEY `fk_stock_movement_location` (`location_id`),
  KEY `fk_stock_movement_order` (`order_id`),
  KEY `fk_stock_movement_product` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `stock_movement`
--

INSERT INTO `stock_movement` (`stock_movement_id`, `created_at`, `movement_type`, `note`, `quantity_change`, `reference`, `location_id`, `order_id`, `product_id`) VALUES
(1, '0000-00-00 00:00:00.000000', 'SALE', 'Sold 2 Coca Cola', -2, 'ORD-001', 1, 1, 1),
(2, '0000-00-00 00:00:00.000000', 'SALE', 'Sold 1 Chips', -1, 'ORD-001', 1, 1, 3),
(3, '0000-00-00 00:00:00.000000', 'SALE', 'Sold 2 Pepsi', -2, 'ORD-002', 1, 2, 2),
(4, '0000-00-00 00:00:00.000000', 'RETURN', 'Customer return shampoo', 1, 'ORD-003', 2, 3, 5),
(5, '2025-09-25 15:09:10.718974', 'RECEIVE', NULL, 10, 'Manual receive', 1, NULL, 3),
(6, '2025-09-25 15:09:33.869922', 'RECEIVE', NULL, 30, 'Manual receive', 1, NULL, 4),
(7, '2025-09-25 15:09:41.881445', 'RECEIVE', NULL, 20, 'Manual receive', 1, NULL, 3),
(8, '2025-09-25 15:27:33.604516', 'SALE', 'Order paid', -1, 'ORDER-4', 1, 4, 1),
(9, '2025-09-25 15:27:33.604516', 'SALE', 'Order paid', -2, 'ORDER-4', 1, 4, 2),
(10, '2025-09-25 18:41:47.880411', 'RECEIVE', NULL, 30, 'Manual receive', 1, NULL, 13),
(11, '2025-09-25 19:18:31.350976', 'SALE', 'Order paid', -2, 'ORDER-6', 1, 6, 1),
(12, '2025-09-25 19:25:13.542603', 'SALE', 'Order paid', -2, 'ORDER-7', 1, 7, 13),
(13, '2025-09-25 19:42:25.085528', 'SALE', 'Order paid', -2, 'ORDER-8', 1, 8, 2),
(14, '2025-09-25 19:42:33.580463', 'SALE', 'Order paid', -2, 'ORDER-9', 1, 9, 2),
(15, '2025-09-25 20:01:07.541353', 'SALE', 'Order paid', -1, 'ORDER-10', 1, 10, 2),
(16, '2025-09-25 22:50:42.457161', 'SALE', 'Order paid', -1, 'ORDER-11', 1, 11, 2),
(17, '2025-09-25 22:55:48.012678', 'SALE', 'Order paid', -1, 'ORDER-12', 1, 12, 1),
(18, '2025-09-25 23:56:38.284608', 'SALE', 'Order paid', -1, 'ORDER-13', 1, 13, 1),
(19, '2025-09-26 00:00:36.912636', 'SALE', 'Order paid', -1, 'ORDER-14', 1, 14, 2),
(20, '2025-09-26 00:04:21.995753', 'SALE', 'Order paid', -1, 'ORDER-15', 1, 15, 2),
(21, '2025-09-26 00:04:44.639977', 'SALE', 'Order paid', -1, 'ORDER-16', 1, 16, 1),
(22, '2025-09-26 10:27:21.726646', 'SALE', 'Order paid', -3, 'ORDER-21', 1, 21, 2),
(23, '2025-09-26 10:27:21.727178', 'SALE', 'Order paid', -2, 'ORDER-21', 1, 21, 13),
(24, '2025-09-26 10:47:35.070597', 'SALE', 'Order paid', -1, 'ORDER-22', 1, 22, 13),
(25, '2025-09-26 10:47:35.072649', 'SALE', 'Order paid', -1, 'ORDER-22', 1, 22, 1),
(26, '2025-09-26 14:48:02.292404', 'SALE', 'Order paid', -2, 'ORDER-23', 1, 23, 1),
(27, '2025-09-26 15:33:02.523510', 'SALE', 'Order paid', -1, 'ORDER-24', 1, 24, 1),
(28, '2025-09-26 23:10:26.745765', 'PURCHASE', 'Purchase order 3', 30, 'PO-3', 1, NULL, 10),
(29, '2025-09-26 23:22:43.072975', 'SALE', 'Order paid', -1, 'ORDER-25', 1, 25, 2),
(30, '2025-09-28 10:31:45.610375', 'SALE', 'Order paid', -1, 'ORDER-27', 1, 27, 1),
(31, '2025-09-28 11:07:34.611113', 'RECEIVE', NULL, 30, 'Manual receive', 1, NULL, 6),
(32, '2025-09-28 11:07:49.747827', 'RECEIVE', NULL, 30, 'Manual receive', 1, NULL, 7),
(33, '2025-09-28 11:10:08.173384', 'SALE', 'Order paid', -1, 'ORDER-29', 1, 29, 4),
(34, '2025-09-30 21:40:20.198169', 'SALE', 'Order paid', -10, 'ORDER-30', 1, 30, 2),
(35, '2025-09-30 22:18:57.056198', 'RECEIVE', NULL, 30, 'Manual receive', 1, NULL, 8);

-- --------------------------------------------------------

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
CREATE TABLE IF NOT EXISTS `supplier` (
  `supplier_id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`supplier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `supplier`
--

INSERT INTO `supplier` (`supplier_id`, `address`, `email`, `name`, `phone`) VALUES
(1, 'Street 1, Phnom Penh', 'abc@supplier.com', 'ABC Supplier', '012345678'),
(2, 'Street 2, Phnom Penh', 'fresh@foods.com', 'FreshFoods Co', '087654321');

-- --------------------------------------------------------

--
-- Table structure for table `tax`
--

DROP TABLE IF EXISTS `tax`;
CREATE TABLE IF NOT EXISTS `tax` (
  `tax_id` bigint NOT NULL AUTO_INCREMENT,
  `tax_amount` double NOT NULL,
  `tax_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('PURCHASE','SALES') NOT NULL,
  `order_id` bigint DEFAULT NULL,
  `po_id` bigint DEFAULT NULL,
  PRIMARY KEY (`tax_id`),
  KEY `fk_tax_order` (`order_id`),
  KEY `fk_tax_purchase_order` (`po_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tax`
--

INSERT INTO `tax` (`tax_id`, `tax_amount`, `tax_date`, `type`, `order_id`, `po_id`) VALUES
(1, 0.5, '2025-09-21 17:49:54', '', 1, NULL),
(2, 0.6, '2025-09-21 17:49:54', '', 2, NULL),
(3, 2, '2025-09-21 17:49:54', '', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `role` enum('ADMIN','CASHIER','MANAGER') NOT NULL,
  `shift` enum('AFTERNOON','EVENING','MORNING') DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `username` varchar(100) NOT NULL,
  `location_id` bigint DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UKsb8bbouer5wak8vyiiy4pf2bx` (`username`),
  KEY `FKneyhvoj17hax43m8dq3u7gbic` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `created_at`, `email`, `password`, `phone`, `role`, `shift`, `status`, `updated_at`, `username`, `location_id`) VALUES
(1, '2025-09-25 23:07:35.000000', 'admin.demo@mini.com', '$2y$12$GOayOeb2sURc5pISlZo3t.FwaT49S9rHh4SCFyH7avXhVMxmddp9O', '099111222', 'ADMIN', 'MORNING', 'ACTIVE', '2025-09-25 23:07:35.000000', 'admin', 1),
(2, '2025-09-25 23:07:35.000000', 'cashier.demo@mini.com', '$2y$12$fPHeX3rcYVqzl3NY73iaNe1M30hMhffqiSU8e0WwVp0lvHYLVKyli', '099333444', 'CASHIER', 'EVENING', 'ACTIVE', '2025-09-25 23:07:35.000000', 'cashier', 1),
(3, '2025-09-26 14:44:00.000000', 'manager.demo@mini.com', '$2y$12$XFV1Fxs2695br3.ifffb..GP2A1eKsOY.Iw3meYa57oGVuGMd9Es2', '099555666', 'MANAGER', 'MORNING', 'ACTIVE', '2025-09-26 14:44:00.000000', 'manager', 1);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `fk_activity_log_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `cash_register`
--
ALTER TABLE `cash_register`
  ADD CONSTRAINT `fk_cash_register_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  ADD CONSTRAINT `fk_cash_register_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `expense`
--
ALTER TABLE `expense`
  ADD CONSTRAINT `fk_expense_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  ADD CONSTRAINT `fk_expense_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`),
  ADD CONSTRAINT `fk_orders_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `order_detail`
--
ALTER TABLE `order_detail`
  ADD CONSTRAINT `fk_orderdetail_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `fk_orderdetail_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `fk_payment_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `fk_payment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `fk_product_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`);

--
-- Constraints for table `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD CONSTRAINT `fk_purchase_order_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  ADD CONSTRAINT `fk_purchase_order_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `supplier` (`supplier_id`);

--
-- Constraints for table `purchase_order_detail`
--
ALTER TABLE `purchase_order_detail`
  ADD CONSTRAINT `fk_purchase_order_detail_order` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`),
  ADD CONSTRAINT `fk_purchase_order_detail_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `stock`
--
ALTER TABLE `stock`
  ADD CONSTRAINT `fk_stock_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  ADD CONSTRAINT `fk_stock_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `stock_movement`
--
ALTER TABLE `stock_movement`
  ADD CONSTRAINT `fk_stock_movement_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`),
  ADD CONSTRAINT `fk_stock_movement_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `fk_stock_movement_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`product_id`);

--
-- Constraints for table `tax`
--
ALTER TABLE `tax`
  ADD CONSTRAINT `fk_tax_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`),
  ADD CONSTRAINT `fk_tax_purchase_order` FOREIGN KEY (`po_id`) REFERENCES `purchase_order` (`po_id`);

--
-- Constraints for table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `FKneyhvoj17hax43m8dq3u7gbic` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
