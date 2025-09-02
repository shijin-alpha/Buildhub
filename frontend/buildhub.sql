-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
<<<<<<< HEAD
-- Generation Time: Aug 31, 2025 at 06:34 PM
=======
-- Generation Time: Aug 15, 2025 at 01:57 PM
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `buildhub`
--

-- --------------------------------------------------------

--
<<<<<<< HEAD
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `action`, `user_id`, `details`, `created_at`) VALUES
(1, 'status_change', 19, '{\"old_status\":\"pending\",\"new_status\":\"approved\",\"user_name\":\"Shijin Thomas\",\"user_email\":\"thomasshijin12@gmail.com\",\"user_role\":\"homeowner\"}', '2025-08-15 11:29:50');

-- --------------------------------------------------------

--
-- Table structure for table `architect_layouts`
--

CREATE TABLE `architect_layouts` (
  `id` int(11) NOT NULL,
  `architect_id` int(11) NOT NULL,
  `layout_request_id` int(11) NOT NULL,
  `design_type` enum('custom','template') NOT NULL,
  `description` text NOT NULL,
  `layout_file` varchar(255) DEFAULT NULL,
  `template_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contractor_proposals`
--

CREATE TABLE `contractor_proposals` (
  `id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `layout_request_id` int(11) NOT NULL,
  `materials` text NOT NULL,
  `cost_breakdown` text NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  `timeline` varchar(100) NOT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contractor_requests_queue`
--

CREATE TABLE `contractor_requests_queue` (
  `id` int(11) NOT NULL,
  `layout_request_id` int(11) NOT NULL,
  `homeowner_id` int(11) NOT NULL,
  `contractor_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `timeline` varchar(100) DEFAULT NULL,
  `share_contact` tinyint(1) DEFAULT 1,
  `status` enum('open','closed') DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `designs`
--

CREATE TABLE `designs` (
  `id` int(11) NOT NULL,
  `layout_request_id` int(11) NOT NULL,
  `architect_id` int(11) NOT NULL,
  `design_title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `design_files` text DEFAULT NULL,
  `status` enum('in-progress','approved','rejected') DEFAULT 'in-progress',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `layout_library`
--

CREATE TABLE `layout_library` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `layout_type` varchar(100) NOT NULL,
  `bedrooms` int(11) NOT NULL,
  `bathrooms` int(11) NOT NULL,
  `area` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `price_range` varchar(100) DEFAULT NULL,
  `architect_id` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `layout_library`
--

INSERT INTO `layout_library` (`id`, `title`, `layout_type`, `bedrooms`, `bathrooms`, `area`, `description`, `image_url`, `price_range`, `architect_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Modern 3BHK Villa', 'Villa', 3, 3, 2500, 'Spacious modern villa with open floor plan, large windows, and contemporary design elements.', '/images/layouts/modern-3bhk-villa.jpg', '25-35 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(2, 'Compact 2BHK Apartment', 'Apartment', 2, 2, 1200, 'Efficient 2BHK apartment design perfect for small families with optimized space utilization.', '/images/layouts/compact-2bhk-apartment.jpg', '12-18 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(3, 'Traditional 4BHK House', 'House', 4, 4, 3200, 'Traditional style house with courtyard, separate dining area, and classic architectural elements.', '/images/layouts/traditional-4bhk-house.jpg', '40-55 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(4, 'Studio Apartment', 'Studio', 1, 1, 600, 'Minimalist studio apartment with smart storage solutions and multi-functional spaces.', '/images/layouts/studio-apartment.jpg', '8-12 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(5, 'Luxury 5BHK Mansion', 'Mansion', 5, 6, 5000, 'Luxurious mansion with premium finishes, multiple living areas, and grand entrance.', '/images/layouts/luxury-5bhk-mansion.jpg', '80+ Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(6, 'Duplex 3BHK', 'Duplex', 3, 3, 2000, 'Two-story duplex with separate living areas on each floor and private terrace.', '/images/layouts/duplex-3bhk.jpg', '22-30 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(7, 'Eco-Friendly 2BHK', 'Eco House', 2, 2, 1500, 'Sustainable design with solar panels, rainwater harvesting, and natural ventilation.', '/images/layouts/eco-friendly-2bhk.jpg', '18-25 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10'),
(8, 'Penthouse Suite', 'Penthouse', 4, 4, 3500, 'Luxury penthouse with panoramic views, private elevator, and rooftop garden.', '/images/layouts/penthouse-suite.jpg', '60-80 Lakhs', NULL, 'active', '2025-08-15 11:00:10', '2025-08-15 11:00:10');

-- --------------------------------------------------------

--
-- Table structure for table `layout_requests`
--

CREATE TABLE `layout_requests` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `homeowner_id` int(11) NOT NULL,
  `plot_size` varchar(100) NOT NULL,
  `budget_range` varchar(100) NOT NULL,
  `requirements` text DEFAULT NULL,
  `preferred_style` varchar(100) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location` varchar(255) DEFAULT NULL,
  `timeline` varchar(100) DEFAULT NULL,
  `selected_layout_id` int(11) DEFAULT NULL,
  `layout_type` enum('custom','library') NOT NULL DEFAULT 'custom',
  `layout_file` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `layout_requests`
--

INSERT INTO `layout_requests` (`id`, `user_id`, `homeowner_id`, `plot_size`, `budget_range`, `requirements`, `preferred_style`, `status`, `created_at`, `updated_at`, `location`, `timeline`, `selected_layout_id`, `layout_type`, `layout_file`) VALUES
(14, 30, 30, '1500', '50+ Lakhs', '{\"plot_shape\":\"Rectangular\",\"topography\":\"flat\",\"development_laws\":\"2 floors\",\"family_needs\":\"kids friendly\",\"rooms\":\"3 bhk\",\"aesthetic\":\"modern\",\"notes\":\"nothing\"}', NULL, 'pending', '2025-08-31 15:53:35', '2025-08-31 15:53:35', 'kottayam', '6-12 months', NULL, 'custom', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `layout_request_assignments`
--

CREATE TABLE `layout_request_assignments` (
  `id` int(11) NOT NULL,
  `layout_request_id` int(11) NOT NULL,
  `homeowner_id` int(11) NOT NULL,
  `architect_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('sent','accepted','declined') DEFAULT 'sent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `layout_request_assignments`
--

INSERT INTO `layout_request_assignments` (`id`, `layout_request_id`, `homeowner_id`, `architect_id`, `message`, `status`, `created_at`, `updated_at`) VALUES
(2, 14, 30, 27, '', 'accepted', '2025-08-31 16:08:15', '2025-08-31 16:08:30'),
(3, 14, 30, 26, '', 'sent', '2025-08-31 16:08:15', '2025-08-31 16:08:15');

-- --------------------------------------------------------

--
-- Table structure for table `layout_templates`
--

CREATE TABLE `layout_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `style` varchar(100) DEFAULT NULL,
  `rooms` int(11) DEFAULT NULL,
  `preview_image` varchar(255) DEFAULT NULL,
  `template_file` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `layout_templates`
--

INSERT INTO `layout_templates` (`id`, `name`, `description`, `style`, `rooms`, `preview_image`, `template_file`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Modern Villa Template', 'Contemporary villa design with open spaces and large windows', 'Modern', 4, NULL, NULL, 'active', '2025-08-15 07:18:01', '2025-08-15 07:18:01'),
(2, 'Traditional House Template', 'Classic house design with traditional architectural elements', 'Traditional', 3, NULL, NULL, 'active', '2025-08-15 07:18:01', '2025-08-15 07:18:01'),
(3, 'Compact Home Template', 'Space-efficient design perfect for small plots', 'Compact', 2, NULL, NULL, 'active', '2025-08-15 07:18:01', '2025-08-15 07:18:01'),
(4, 'Luxury Mansion Template', 'Grand mansion design with premium features', 'Luxury', 6, NULL, NULL, 'active', '2025-08-15 07:18:01', '2025-08-15 07:18:01'),
(5, 'Eco-Friendly Home Template', 'Sustainable design with green building features', 'Eco-Friendly', 3, NULL, NULL, 'active', '2025-08-15 07:18:01', '2025-08-15 07:18:01');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `name`, `category`, `unit`, `price`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Portland Cement', 'cement', 'bag (50kg)', 350.00, 'High quality Portland cement for construction', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(2, 'TMT Steel Bars', 'steel', 'kg', 65.00, 'Fe500 grade TMT steel bars', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(3, 'Red Clay Bricks', 'bricks', 'piece', 8.50, 'Standard size red clay bricks', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(4, 'River Sand', 'sand', 'cubic meter', 1200.00, 'Fine river sand for construction', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(5, 'Crushed Stone', 'gravel', 'cubic meter', 1500.00, '20mm crushed stone aggregate', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(6, 'Teak Wood', 'wood', 'cubic feet', 2500.00, 'Premium teak wood for furniture', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(7, 'Ceramic Floor Tiles', 'tiles', 'sq ft', 45.00, '2x2 feet ceramic floor tiles', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(8, 'Exterior Paint', 'paint', 'liter', 180.00, 'Weather resistant exterior paint', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(9, 'Copper Wire', 'electrical', 'meter', 12.00, '2.5mm copper electrical wire', '2025-08-15 06:39:48', '2025-08-15 06:39:48'),
(10, 'PVC Pipes', 'plumbing', 'meter', 85.00, '4 inch PVC pipes for plumbing', '2025-08-15 06:39:48', '2025-08-15 06:39:48');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `password_resets`
--

INSERT INTO `password_resets` (`id`, `user_id`, `email`, `token_hash`, `expires_at`, `used`, `created_at`) VALUES
(1, 30, 'fathima470077@gmail.com', 'ad3484cae65594d475d3645407e4a456be1d15a04489eaf526da38f89f0ef785', '2025-08-31 08:45:10', 1, '2025-08-31 05:45:10'),
(2, 30, 'fathima470077@gmail.com', '048ca2716ede4bf0cd6d31f31283f0767c6938ba3b3d20cdadf35dbd1aa3dbf2', '2025-08-31 08:46:12', 1, '2025-08-31 05:46:12'),
(3, 30, 'fathima470077@gmail.com', '731a165630d5a22e912102647e0167b7badbe04fa24ffd67ed2c3315b2fbc112', '2025-08-31 08:51:13', 1, '2025-08-31 05:51:13'),
(4, 30, 'fathima470077@gmail.com', 'ea570e6c6f9c68473d8b8af7f29be0184dc08a1d50a4ae1febcca6d307d4a9a4', '2025-08-31 08:54:16', 1, '2025-08-31 05:54:16'),
(5, 30, 'fathima470077@gmail.com', '995292a1d0bc99ad09b2fc1102de8023de4350a4092714f4b1a94a70198a21b6', '2025-08-31 08:57:30', 1, '2025-08-31 05:57:30');

-- --------------------------------------------------------

--
-- Table structure for table `proposals`
--

CREATE TABLE `proposals` (
  `id` int(11) NOT NULL,
  `layout_request_id` int(11) NOT NULL,
  `contractor_id` int(11) NOT NULL,
  `amount` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
=======
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
<<<<<<< HEAD
  `profile_image` varchar(255) DEFAULT NULL,
=======
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zip_code` varchar(10) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('homeowner','contractor','architect') DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `is_verified` tinyint(1) DEFAULT 0,
  `license` varchar(255) DEFAULT NULL,
  `portfolio` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

<<<<<<< HEAD
INSERT INTO `users` (`id`, `first_name`, `last_name`, `profile_image`, `email`, `password`, `role`, `status`, `is_verified`, `license`, `portfolio`, `created_at`, `updated_at`) VALUES
(19, 'Shijin', 'Thomas', NULL, 'thomasshijin12@gmail.com', '$2y$10$3gq5TYKFrxe79x7Bd6zfYeop4C3lPHlT0RBbDCRK8Wd/olTpWnsNK', 'homeowner', 'approved', 1, NULL, NULL, '2025-08-15 08:37:34', '2025-08-15 11:29:50'),
(26, 'APARNA K SANTHOSH', 'MCA2024-2026', NULL, 'aparnaksanthosh2026@mca.ajce.in', '$2y$10$3h5YpKY7duoyJ5YHWNRtpOP0a5hyLXfCiy1mzGG.Dgsaz10KZMehu', 'architect', 'pending', 1, NULL, 'uploads/portfolios/68a421323b2f3_license_20.jpeg', '2025-08-19 07:01:06', '2025-08-19 07:01:41'),
(27, 'Shijin', 'Thomas', NULL, 'shijinthomas1501@gmail.com', '$2y$10$i/i/4o20DEqfRIsuEsLw..7OEL.5HhWbOQFSLcKBfz.XN0a47uGbu', 'architect', 'pending', 1, NULL, '/uploads/portfolios/68a89de45ea03_license_20.jpeg', '2025-08-22 16:42:12', '2025-08-22 16:42:23'),
(28, 'SHIJIN THOMAS', 'MCA2024-2026', NULL, 'shijinthomas2026@mca.ajce.in', '$2y$10$J243fQ/Wi88Bk9UbtlSKvOJStinlPcePeWgV8C0gApCZnxbG5qRfe', 'homeowner', 'pending', 1, NULL, NULL, '2025-08-22 17:48:50', '2025-08-22 17:48:50'),
(29, 'Shijin', 'Thomas', NULL, 'shijinthomas248@gmail.com', '$2y$10$m6o/je.6qIdMD6/k17enr.0QD0PAYSYSIyhTHF5b9Hs57hpqMsvR6', 'contractor', 'pending', 1, 'uploads/licenses/68b1a6aa444ec_license_20.jpeg', NULL, '2025-08-29 13:10:02', '2025-08-29 13:10:28'),
(30, 'Fathima', 'Shibu', NULL, 'fathima470077@gmail.com', '$2y$10$ZFxAkA99J0LlBoYyr0TPne2PTEc5qFDDwFOCYoaZnH3m6a/ztMRSG', 'homeowner', 'pending', 1, NULL, NULL, '2025-08-31 05:37:04', '2025-08-31 05:59:14');
=======
INSERT INTO `users` (`id`, `first_name`, `last_name`, `phone`, `address`, `city`, `state`, `zip_code`, `profile_image`, `bio`, `specialization`, `experience_years`, `license_number`, `company_name`, `website`, `email`, `password`, `role`, `status`, `is_verified`, `license`, `portfolio`, `created_at`, `updated_at`) VALUES
(19, 'Shijin', 'Thomas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'thomasshijin12@gmail.com', '$2y$10$3gq5TYKFrxe79x7Bd6zfYeop4C3lPHlT0RBbDCRK8Wd/olTpWnsNK', 'homeowner', 'approved', 1, NULL, NULL, '2025-08-15 08:37:34', '2025-08-15 11:29:50'),
(20, 'Shijin', 'Thomas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'shijinthomas248@gmail.com', '$2y$10$a.t0M4XwY5fP9XrrPYQdbOUY/OlHg6DaCUcWcw5unr87WC.bRxAx6', 'contractor', 'pending', 1, 'uploads/licenses/689ef28be6f60_license.jpeg', NULL, '2025-08-15 08:40:44', '2025-08-15 09:18:01'),
(21, 'Shijin', 'Thomas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'shijinthomas1501@gmail.com', '$2y$10$l82yykygxrE71jFPopliw.jV64a3vO9GB1lAtH7P.uyJqSo/ZNOoi', 'architect', 'pending', 1, NULL, 'uploads/portfolios/689f066e47a60_port.jpg', '2025-08-15 10:05:34', '2025-08-15 10:05:53');
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235

--
-- Indexes for dumped tables
--

--
<<<<<<< HEAD
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `architect_layouts`
--
ALTER TABLE `architect_layouts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_architect_layouts_architect` (`architect_id`),
  ADD KEY `idx_architect_layouts_request` (`layout_request_id`),
  ADD KEY `idx_architect_layouts_status` (`status`);

--
-- Indexes for table `contractor_proposals`
--
ALTER TABLE `contractor_proposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contractor_proposals_contractor` (`contractor_id`),
  ADD KEY `idx_contractor_proposals_request` (`layout_request_id`),
  ADD KEY `idx_contractor_proposals_status` (`status`);

--
-- Indexes for table `contractor_requests_queue`
--
ALTER TABLE `contractor_requests_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `layout_request_id` (`layout_request_id`),
  ADD KEY `homeowner_id` (`homeowner_id`),
  ADD KEY `contractor_id` (`contractor_id`);

--
-- Indexes for table `designs`
--
ALTER TABLE `designs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `layout_request_id` (`layout_request_id`),
  ADD KEY `architect_id` (`architect_id`);

--
-- Indexes for table `layout_library`
--
ALTER TABLE `layout_library`
  ADD PRIMARY KEY (`id`),
  ADD KEY `architect_id` (`architect_id`);

--
-- Indexes for table `layout_requests`
--
ALTER TABLE `layout_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_layout_requests_homeowner` (`homeowner_id`),
  ADD KEY `idx_layout_requests_status` (`status`),
  ADD KEY `idx_lr_user_id` (`user_id`),
  ADD KEY `idx_lr_homeowner_id` (`homeowner_id`),
  ADD KEY `idx_lr_selected_layout_id` (`selected_layout_id`),
  ADD KEY `idx_lr_status` (`status`),
  ADD KEY `idx_lr_created_at` (`created_at`);

--
-- Indexes for table `layout_request_assignments`
--
ALTER TABLE `layout_request_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_lr_arch` (`layout_request_id`,`architect_id`),
  ADD KEY `homeowner_id` (`homeowner_id`),
  ADD KEY `architect_id` (`architect_id`);

--
-- Indexes for table `layout_templates`
--
ALTER TABLE `layout_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `email` (`email`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `expires_at` (`expires_at`);

--
-- Indexes for table `proposals`
--
ALTER TABLE `proposals`
  ADD PRIMARY KEY (`id`);

--
=======
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
<<<<<<< HEAD
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `architect_layouts`
--
ALTER TABLE `architect_layouts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contractor_proposals`
--
ALTER TABLE `contractor_proposals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contractor_requests_queue`
--
ALTER TABLE `contractor_requests_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `designs`
--
ALTER TABLE `designs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `layout_library`
--
ALTER TABLE `layout_library`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `layout_requests`
--
ALTER TABLE `layout_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `layout_request_assignments`
--
ALTER TABLE `layout_request_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `layout_templates`
--
ALTER TABLE `layout_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `proposals`
--
ALTER TABLE `proposals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `architect_layouts`
--
ALTER TABLE `architect_layouts`
  ADD CONSTRAINT `architect_layouts_ibfk_1` FOREIGN KEY (`architect_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `architect_layouts_ibfk_2` FOREIGN KEY (`layout_request_id`) REFERENCES `layout_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contractor_proposals`
--
ALTER TABLE `contractor_proposals`
  ADD CONSTRAINT `contractor_proposals_ibfk_1` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contractor_proposals_ibfk_2` FOREIGN KEY (`layout_request_id`) REFERENCES `layout_requests` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `contractor_requests_queue`
--
ALTER TABLE `contractor_requests_queue`
  ADD CONSTRAINT `contractor_requests_queue_ibfk_1` FOREIGN KEY (`layout_request_id`) REFERENCES `layout_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contractor_requests_queue_ibfk_2` FOREIGN KEY (`homeowner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contractor_requests_queue_ibfk_3` FOREIGN KEY (`contractor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `designs`
--
ALTER TABLE `designs`
  ADD CONSTRAINT `designs_ibfk_1` FOREIGN KEY (`layout_request_id`) REFERENCES `layout_requests` (`id`),
  ADD CONSTRAINT `designs_ibfk_2` FOREIGN KEY (`architect_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `layout_library`
--
ALTER TABLE `layout_library`
  ADD CONSTRAINT `layout_library_ibfk_1` FOREIGN KEY (`architect_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `layout_requests`
--
ALTER TABLE `layout_requests`
  ADD CONSTRAINT `fk_lr_homeowner` FOREIGN KEY (`homeowner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_lr_selected_layout` FOREIGN KEY (`selected_layout_id`) REFERENCES `layout_library` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_lr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `layout_requests_ibfk_1` FOREIGN KEY (`homeowner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `layout_request_assignments`
--
ALTER TABLE `layout_request_assignments`
  ADD CONSTRAINT `layout_request_assignments_ibfk_1` FOREIGN KEY (`layout_request_id`) REFERENCES `layout_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `layout_request_assignments_ibfk_2` FOREIGN KEY (`homeowner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `layout_request_assignments_ibfk_3` FOREIGN KEY (`architect_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
=======
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;
>>>>>>> 72588aad4ec69605b25ef4fe70cda4054305a235
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
