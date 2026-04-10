-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-04-2026 a las 00:45:11
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `don_diego_2016`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `c.i` int(11) NOT NULL,
  `NOMBRE` varchar(20) NOT NULL,
  `telefono` varchar(11) NOT NULL,
  `direccion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`c.i`, `NOMBRE`, `telefono`, `direccion`) VALUES
(999, 'CLIENTE GENERAL', '---', ''),
(16292808, 'maira salcedo', '04125164833', 'payara'),
(30766666, 'eliezer guedez', '04125113952', 'payara');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `det_factura`
--

CREATE TABLE `det_factura` (
  `id_Det_factura` int(255) NOT NULL,
  `sub_total` decimal(10,2) NOT NULL,
  `total_iva` int(255) NOT NULL,
  `id_factura` int(255) NOT NULL,
  `codigo_producto` varchar(50) NOT NULL,
  `cantidad` int(255) NOT NULL,
  `total_bs` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `det_factura`
--

INSERT INTO `det_factura` (`id_Det_factura`, `sub_total`, `total_iva`, `id_factura`, `codigo_producto`, `cantidad`, `total_bs`) VALUES
(89, 1.00, 0, 70, '0000012307318', 1, 480),
(90, 1.60, 0, 71, '0010621160205', 1, 800),
(91, 0.80, 0, 72, '0073930680109', 1, 400),
(92, 0.15, 0, 72, '3170467310003', 1, 75),
(93, 3.13, 0, 73, '0', 1, 1500);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `factura`
--

CREATE TABLE `factura` (
  `id_factura` int(255) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `ci_cliente` int(11) NOT NULL,
  `nombre_empleado` varchar(100) NOT NULL DEFAULT 'Sin Nombre',
  `tipo_pago` varchar(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `factura`
--

INSERT INTO `factura` (`id_factura`, `fecha`, `hora`, `ci_cliente`, `nombre_empleado`, `tipo_pago`) VALUES
(70, '2026-04-08', '18:10:20', 30766666, 'Eliezer Guedez', 'Efectivo'),
(71, '2026-04-08', '18:15:01', 30766666, 'Eliezer Guedez', 'Pago Móvil'),
(72, '2026-04-08', '18:16:08', 999, 'Eliezer Guedez', 'Efectivo'),
(73, '2026-04-08', '18:27:55', 30766666, 'Eliezer Guedez', 'Punto');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `Codigo` varchar(50) NOT NULL,
  `marca` text NOT NULL,
  `nombre` text NOT NULL,
  `categoria` text NOT NULL,
  `unidades` int(255) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `i.v.a.` int(11) NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT 1,
  `presentacion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`Codigo`, `marca`, `nombre`, `categoria`, `unidades`, `precio`, `i.v.a.`, `estado`, `presentacion`) VALUES
('0', '', 'Monto Adicional', '', 999999, 0.00, 0, 1, ''),
('0000012307318', 'Girafa', 'Saca punta', 'Otro', 41, 1.00, 0, 1, '1 unidad'),
('0002730', 'Color Fragancia', 'Condon', 'Cuidado Personal y Hogar', 50, 0.80, 0, 1, '3 unidades'),
('0010621160205', 'Garbil', 'Pala de Mano', 'Cuidado Personal y Hogar', 49, 1.60, 0, 1, '1 unidad'),
('0012245134037', 'Venepan', 'Carne de Soya', 'Despensa', 49, 3.13, 0, 1, '250g'),
('0073930680109', 'DUO', 'Pega de Pestaña', 'Otro', 49, 0.80, 0, 1, '9g'),
('0159000000067', 'Las Llaves', 'Jabon en Polvo Bebe', 'Cuidado Personal y Hogar', 49, 1.90, 0, 1, '400g'),
('02010010A', 'Esencia Nata ', 'Esencia Nata ', 'Despensa', 50, 2.80, 0, 1, '75g'),
('02010090M', 'Esencia Chicle Azul', 'Esencia Chicle Azul', 'Despensa', 50, 5.88, 0, 1, '1/2L'),
('02590003C', 'Caramelina', 'Caramelina', 'Despensa', 50, 1.45, 0, 1, '150g'),
('0401421660697', 'Nelly', 'Mantequilla ', 'Despensa', 49, 3.56, 0, 1, '500g'),
('0658325687316', 'Gosto', 'Salsa de Tomate ', 'Despensa', 50, 1.24, 0, 1, '198g'),
('0658325687408', 'Gosto', 'Salsa Rosada ', 'Despensa', 50, 1.54, 0, 1, '190g'),
('0719503030123', 'Mavesa', 'Mayonesa ', 'Despensa', 50, 4.96, 0, 1, '445g'),
('0737186103361', 'Gosto', 'Mayonesa ', 'Despensa', 50, 3.80, 0, 1, '445g'),
('0737186103378', 'Gosto', 'Mayonesa ', 'Despensa', 50, 2.00, 0, 1, '175g'),
('0745853822873', 'Gosto', 'Vinagre ', 'Despensa', 50, 2.30, 0, 1, '500ml'),
('0765542343052', 'Wepa', 'Arequipe ', 'Despensa', 50, 2.03, 0, 1, '100g'),
('0799439302334', 'Younghair', 'Champu de Color', 'Otro', 46, 1.50, 0, 1, '25ml'),
('0823543359', 'Blend Max', 'Desinfectante para Diluir citronela', 'Cuidado Personal y Hogar', 50, 2.20, 0, 1, '100ml'),
('0823543360', 'Blend Max', 'Desinfectante para Diluir Marina', 'Cuidado Personal y Hogar', 50, 2.20, 0, 1, '100ml'),
('0824772000101', 'La Nieve', 'Crayones de Cera', 'Otro', 50, 2.60, 0, 1, '12 colores'),
('17592559000179', 'Resca', 'Papas doradas ', 'Despensa', 50, 1.50, 0, 1, '200g'),
('17597597004721', 'Luxus', 'Emsendedor ', 'Despensa', 50, 0.20, 0, 1, '1 unidad'),
('27500435002442', 'Head & Shoulders', 'Shanpoo control Caspa', 'Cuidado Personal y Hogar', 50, 0.50, 0, 1, '18ml'),
('3170467310003', 'MedAid', 'Jeringa Esteril ', 'Otro', 51, 0.15, 0, 1, '3cc/ml'),
('4507329840349', 'Monachos', 'Crayones de Cera', 'Otro', 50, 2.60, 0, 1, '12 colores'),
('4591449607586', 'Alfonzo Rivas & Cia', 'Maizina Americana ', 'Despensa', 50, 1.10, 0, 1, '90g'),
('5029900015209', 'Embajador colegial', 'Medias', 'Otro', 50, 1.00, 0, 1, 'talla 2-4'),
('5029900028445', 'Nirvana', 'Medias', 'Otro', 50, 1.00, 0, 1, 'Talla 9-11'),
('5029900028599', 'Fashion', 'Medias', 'Otro', 50, 1.00, 0, 1, 'Talla 9-11'),
('5591597000825', 'Baby Finger', 'Petroleum', 'Otro', 50, 3.00, 0, 1, '120g'),
('5958484484906', 'Monper', 'Desinfectante Cherry', 'Cuidado Personal y Hogar', 50, 1.00, 0, 1, '500ml'),
('5958484589533', 'Monper', 'Lavaplatos', 'Cuidado Personal y Hogar', 50, 3.26, 0, 1, '1.5L'),
('5958484731475', 'Monper', 'Desinfectante Lavanda', 'Cuidado Personal y Hogar', 50, 2.40, 0, 1, '1.5L'),
('6580901071018', 'Saca Punta Metal', 'Saca Punta Metal', 'Otro', 49, 0.20, 0, 1, '1 unidad'),
('6820235030016', 'Escarcha', 'Escarcha', 'Otro', 50, 1.50, 0, 1, '120g'),
('6910021007206', 'Colgate', 'Cepillo de Dientes Mediano', 'Cuidado Personal y Hogar', 50, 1.47, 0, 1, '1 unidad'),
('6913617148352', 'Wiki wiki', 'negro', 'Otro', 50, 1.00, 0, 1, '15g'),
('6916119062089', 'Drotafarma', 'Diclofena', 'Otro', 50, 1.60, 0, 1, '50 mg'),
('6917790979642', 'Gloripan', 'Levadura', 'Despensa', 50, 10.00, 0, 1, '500g'),
('6920911698292', 'Shumeijia', 'Peine', 'Cuidado Personal y Hogar', 50, 0.80, 0, 1, '1 unidad'),
('6930691010085', 'Highlighter Marker', 'resaltadores', 'Otro', 50, 0.60, 0, 1, '1 unidad'),
('6932577677054', 'Maksim', 'Cepillo de Dientes Kids', 'Cuidado Personal y Hogar', 50, 2.11, 0, 1, '1 unidad'),
('6932799520282', 'Mediplast', 'Curitas', 'Otro', 50, 0.20, 0, 1, '1 unidad'),
('6936664321080', 'Boszs Orance', 'Set de Prefune y Crema', 'Cuidado Personal y Hogar', 50, 4.00, 0, 1, '90ml y 95ml'),
('6936664321165', 'Swisse Montane', 'Set de Prefune y Crema', 'Cuidado Personal y Hogar', 50, 4.00, 0, 1, '90ml y 95ml'),
('6936664327259', 'Las Bellezas', 'BVAGRLI AVQA', 'Cuidado Personal y Hogar', 50, 3.50, 0, 1, '35ml y 35ml'),
('6936664327273', 'Las Bellezas', 'ISSE MLYAKE', 'Cuidado Personal y Hogar', 50, 3.50, 0, 1, '35ml y 35ml'),
('6944977122126', 'Cheery', 'Cheery', 'Cuidado Personal y Hogar', 50, 0.40, 0, 1, '30g'),
('6945745405038', 'Toys', 'Pistola de Agua', 'Otro', 50, 4.00, 0, 1, '1 unidad'),
('6948447510406', 'El Gran 8', 'Papel Crepe ', 'Otro', 50, 0.65, 0, 1, '50x200cm'),
('6951223845128', 'Hugme', 'Hojas de Examen', 'Otro', 50, 0.06, 0, 1, '21x31cm'),
('6952245033012', 'paletas', 'paletas', 'Otro', 50, 0.40, 0, 1, '52 unidades'),
('6954259127374', 'RCS', 'Marcadores Acrilicos', 'Otro', 50, 0.80, 0, 1, '1 unidad'),
('6956288663304', 'Purely Natural', 'Palitos de Altura', 'Otro', 50, 0.80, 0, 1, '8cm x32cm x1cm '),
('6956335300497', 'Kingcboy', 'Baterias AA', 'Otro', 50, 4.00, 0, 1, '4 unidades'),
('6970081494330', 'Rat Glue', 'Veneno de Ratas', 'Otro', 50, 1.00, 0, 1, '100g'),
('6970081495009', 'Green killer', 'Fly Glue Board', 'Cuidado Personal y Hogar', 50, 0.50, 0, 1, 'C6'),
('6970081495023', 'Green killer', 'Fly Catch Trap', 'Cuidado Personal y Hogar', 50, 1.00, 0, 1, '4 unidades'),
('6971136471290', 'Medical Antipyretic Patch', 'Medical Antipyretic Patch', 'Otro', 50, 1.00, 0, 1, '50mm x 120mm'),
('6971196225031', 'Sebas', 'Silicona Liquida', 'Otro', 52, 2.00, 0, 1, '100ml'),
('6971196254048', 'Sebas', 'Pegamento Blanco', 'Otro', 50, 1.00, 0, 1, '100g'),
('6972121237464', 'Fashion', 'Llavero', 'Otro', 50, 0.50, 0, 1, '1 unidad'),
('6972331780088', 'Maksim', 'Boligrafo Azul', 'Otro', 50, 0.16, 0, 1, '0.7mm'),
('6972527950639', 'bai Hu Luo Gao ', 'bai Hu Luo Gao ', 'Otro', 50, 1.00, 0, 1, '70mm x 100mm'),
('6972686565460', 'Paletas de Colores', 'Paletas de Colores', 'Otro', 50, 0.40, 0, 1, '52 unidades'),
('6978425013025', 'Eraser', 'Goma de borrar', 'Otro', 50, 0.30, 0, 1, '1 unidad'),
('6983848517685', 'Yong Chao', 'Safety Scissors', 'Cuidado Personal y Hogar', 50, 0.70, 0, 1, '1 unidad'),
('7045056480003', 'Crisvi', 'Papel Crepe ', 'Otro', 50, 0.65, 0, 1, '50x200cm'),
('7453010000028', 'Pointer', 'Crayones de Cera', 'Otro', 50, 2.60, 0, 1, '12 colores'),
('7453010047405', 'Pointer', 'Regla', 'Otro', 50, 0.30, 0, 1, '30cm'),
('7453010058876', 'Pointer', 'Tempera Neon', 'Otro', 50, 8.50, 0, 1, '6 unidades'),
('7453015149883', 'Studmark', 'Broche Sujetapapeles', 'Otro', 50, 0.25, 0, 1, '1 unidad'),
('7453038413466', 'Pointer', 'resaltadores', 'Otro', 50, 0.75, 0, 1, '1 unidad'),
('7453038430593', 'Pointer', 'Colores Pastel', 'Otro', 50, 3.90, 0, 1, '12 colores'),
('7453038477826', 'Pointer', 'Marcadores Acrilicos', 'Otro', 50, 0.80, 0, 1, '1 unidad'),
('7453038499347', 'Pointer', 'Acrilicos Escarchado', 'Otro', 50, 0.75, 0, 1, '1 unidades'),
('7453038499828', 'Pointer', 'Lienzo', 'Otro', 50, 1.50, 0, 1, '20x20cm'),
('7500435020046', 'Head & Shoulders', 'Shanpoo control Caspa', 'Cuidado Personal y Hogar', 50, 13.75, 0, 1, '375ml'),
('7500435108294', 'Pantene', 'Pro-V', 'Cuidado Personal y Hogar', 50, 0.50, 0, 1, '18ml'),
('7500435143769', 'Pantene', 'Crema para Peinar', 'Cuidado Personal y Hogar', 50, 0.50, 0, 1, '16ml'),
('7500435144735', 'Head & Shoulders', 'Shanpoo control Caspa Aceite de Coco', 'Cuidado Personal y Hogar', 50, 0.50, 0, 1, '18ml'),
('7500435151320', 'Pantene', 'Pro-V Miracles', 'Cuidado Personal y Hogar', 50, 1.00, 0, 1, '30ml'),
('7500435155830', 'Pantene', 'Shanpoo control Caida', 'Cuidado Personal y Hogar', 50, 7.90, 0, 1, '200ml'),
('7500435155847', 'Pantene', 'Shanpoo control Caida', 'Cuidado Personal y Hogar', 50, 13.12, 0, 1, '400ml'),
('7500435172035', 'Ariel', 'Jabon Liquido', 'Cuidado Personal y Hogar', 50, 8.20, 0, 1, '1.6L'),
('7501006721294', 'Pantene', 'Acondicionador', 'Cuidado Personal y Hogar', 50, 7.90, 0, 1, '200ml'),
('7501033204920', 'Speed Stick', 'Desodorante ', 'Cuidado Personal y Hogar', 50, 1.90, 0, 1, '30g'),
('7501065922243', 'Head & Shoulders', 'Shanpoo control Caspa 2 en 1', 'Cuidado Personal y Hogar', 50, 0.50, 0, 1, '18ml'),
('7509546674810', 'Speed Stick', 'Desodorante de Sobre', 'Cuidado Personal y Hogar', 50, 0.65, 0, 1, '9g'),
('7509546676142', 'Suavitel', 'suavizante', 'Cuidado Personal y Hogar', 50, 0.95, 0, 1, '180ml'),
('7509546685182', 'Colgate', 'Crema Dental', 'Cuidado Personal y Hogar', 50, 2.11, 0, 1, '60ml'),
('7509546688299', 'Speed Stick', 'Desodorante de Sobre clinical', 'Cuidado Personal y Hogar', 50, 0.65, 0, 1, '9g'),
('7509546694566', 'Axion', 'Jabon Lavaplatos', 'Cuidado Personal y Hogar', 50, 1.88, 0, 1, '235g'),
('7590006200137', 'Mavesa', 'Mantequilla ', 'Despensa', 50, 3.71, 0, 1, '500g'),
('7590006301582', 'Las Llaves', 'Jabon en Polvo', 'Cuidado Personal y Hogar', 50, 1.90, 0, 1, '400g'),
('7590024118704', 'Icono', 'Marcadores Acrilicos', 'Otro', 50, 0.80, 0, 1, '1 unidad'),
('7590027000679', 'Spefar', 'Loratadina', 'Otro', 50, 3.00, 0, 1, '60ml'),
('75903206', 'Consul', 'Cigarrillo', 'Otro', 50, 1.87, 0, 1, '20 unidades'),
('7590324000013', 'Aurora', 'Cafe Aurora ', 'Despensa', 48, 1.55, 0, 1, '100g'),
('7590324000020', 'Aurora', 'Cafe Aurora ', 'Despensa', 50, 2.83, 0, 1, '200g'),
('7590324000051', 'Aurora', 'Caraotas Negras ', 'Despensa', 50, 1.43, 0, 1, '400g'),
('7590324000075', 'Aurora', 'Arvejas ', 'Despensa', 50, 1.80, 0, 1, '400g'),
('7590324000082', 'Aurora', 'Lentejas ', 'Despensa', 50, 2.26, 0, 1, '400g'),
('7590324000099', 'Aurora', 'Maiz para Cotufas ', 'Despensa', 50, 1.76, 0, 1, '400g'),
('7590324000181', 'Aurora', 'Arroz tipo 1', 'Despensa', 49, 1.78, 0, 1, '900g'),
('7590324000198', 'Aurora', 'Azucar', 'Despensa', 50, 2.07, 0, 1, '1kg'),
('7590357000042', 'Mimasa', 'Arroz tipo 1', 'Despensa', 50, 1.89, 0, 1, '900g'),
('75903923', 'Viceroy', 'Cigarrillo', 'Otro', 50, 2.12, 0, 1, '20 unidades'),
('75905156', 'CIR', 'Malta Regional', 'Bebida no Alcolicas', 50, 0.65, 0, 1, '207ml'),
('7591002200145', 'Polar', 'P.A.N. ', 'Despensa', 50, 2.00, 0, 1, '1Kg'),
('7591002700058', 'margarita', 'pepitonas en salsa picante ', 'Enlatado', 50, 2.50, 0, 1, '140g'),
('7591002700164', 'margarita', 'Sardina en aceite vegetal ', 'Enlatado', 50, 1.50, 0, 1, '170g'),
('7591015001227', 'La Giralda ', 'Vinagre ', 'Despensa', 50, 1.90, 0, 1, '1L'),
('7591016204894', 'Maggi', 'Sopa de Polla con Fideos', 'Despensa', 50, 1.72, 0, 1, '62g'),
('7591016205709', 'Maggi', 'Cubito de Pollo', 'Despensa', 50, 0.20, 0, 1, '0.01'),
('7591031000051', 'Pepsi_Cola', 'Pepsi ', 'Bebida no Alcolicas', 50, 0.60, 0, 1, '350ml'),
('7591031000624', 'Pepsi-Cola', 'Golden Colita', 'Bebida no Alcolicas', 50, 0.60, 0, 1, '350ml'),
('7591031000631', 'Pepsi-Cola', 'Golden Manzana', 'Bebida no Alcolicas', 50, 0.60, 0, 1, '350ml'),
('7591031000679', 'Pepsi-Cola', 'Golden Uva', 'Bebida no Alcolicas', 50, 0.60, 0, 1, '350ml'),
('7591031003557', 'Pepsi-Cola', '7up', 'Bebida no Alcolicas', 50, 0.60, 0, 1, '350ml'),
('7591039657110', 'Alfonzo Rivas & Cia', 'Maizina Americana ', 'Despensa', 50, 2.11, 0, 1, '200g'),
('7591039770734', 'Alfonzo Rivas & Cia', 'Maizina Americana ', 'Despensa', 50, 1.17, 0, 1, '120g'),
('7591058001024', 'Coposa', 'Aceite Vegetal ', 'Despensa', 49, 4.50, 0, 1, '850 ml'),
('7591072000027', 'Underwood', 'Diablito ', 'Despensa', 50, 1.80, 0, 1, '54g'),
('7591072003622', 'Underwood', 'Diablito ', 'Despensa', 50, 2.34, 0, 1, '155g'),
('7591083018561', 'Suavitel', 'suavizantes', 'Otro', 50, 3.31, 0, 1, '500ml'),
('7591098000759', 'Rosal Towels', 'tuallin Multiusod', 'Cuidado Personal y Hogar', 50, 2.00, 0, 1, '80 hojas'),
('7591098000919', 'Royal Plus', 'Papel Higienico', 'Otro', 50, 0.44, 0, 1, '180 hojas'),
('7591104000193', 'Robin Hood', 'Harina de Trigo Todo Uso', 'Despensa', 50, 1.86, 0, 1, '900g'),
('7591112000697', 'Polly', 'Caldo de Pera', 'Bebida no Alcolicas', 50, 0.68, 0, 1, '100g'),
('7591127914576', 'Coca Cola', 'Schweppes', 'Bebida no Alcolicas', 50, 0.80, 0, 1, '355ml'),
('7591141990532', 'Mc Cormick', 'Salsa BBQ ', 'Despensa', 50, 4.40, 0, 1, '230ml'),
('7591151401035', 'Capri', 'Pasta Larga ', 'Despensa', 48, 2.07, 0, 1, '1k'),
('7591181000413', 'Horizonte', 'pasta Tubito liso n.2 ', 'Despensa', 50, 2.04, 0, 1, '1k'),
('7591181000529', 'Horizonte', 'Pasta Codos ', 'Despensa', 49, 2.04, 0, 1, '1k'),
('7591181019118', 'Horizonte', 'Pasta larga ', 'Despensa', 50, 1.88, 0, 1, '1k'),
('7591196002785', 'Apiret', 'Acetaminofen', 'Otro', 50, 5.00, 0, 1, '120ml'),
('7591201353123', 'La Panpa', 'Harina de Trigo Leudante', 'Despensa', 50, 1.64, 0, 1, '920g'),
('7591202101167', 'Eureka!', 'Mostaza ', 'Despensa', 50, 2.50, 0, 1, '285g'),
('7591309000066', 'Dioxogen', 'Desodorante ', 'Cuidado Personal y Hogar', 50, 2.61, 0, 1, '90g'),
('7591309002183', 'Overskin', 'Crema Antipañalitis', 'Cuidado Personal y Hogar', 50, 3.24, 0, 1, '50g'),
('7591446000660', 'Polar', 'Maltin', 'Bebida no Alcolicas', 50, 0.68, 0, 1, '222ml'),
('75916220', 'Heinz', 'Salsa de Tomate ', 'Despensa', 50, 1.65, 0, 1, '198g'),
('7591904001116', 'Valle Hondo', 'Fororo ', 'Despensa', 50, 1.00, 0, 1, '250g'),
('75919184', 'Panpero', 'Salsa de Tomate ', 'Despensa', 50, 2.64, 0, 1, '198g'),
('75919191', 'Panpero', 'Salsa de Tomate ', 'Despensa', 50, 3.20, 0, 1, '397g'),
('7591944000629', 'La especial', 'pasta Tubito liso n.2', 'Despensa', 50, 2.04, 0, 1, '1k'),
('75921064', 'Pall Mall', 'Cigarrillo', 'Otro', 49, 3.33, 1, 1, '20 unidades'),
('7592225000253', 'Incosa', 'Sardina en salsa de tomate ', 'Enlatado', 50, 1.00, 0, 1, '170g'),
('7592282021017', 'El campecino', 'Caraotas Negras ', 'Despensa', 50, 1.98, 0, 1, '400g'),
('7592396003787', 'Maita', 'Leche Condensada', 'Despensa', 50, 2.50, 0, 1, '340g'),
('7592396005187', 'Maita', 'Sweetened Condensed', 'Enlatado', 50, 3.00, 0, 1, '390g'),
('7592591000475', 'doña Emilia', 'Harina de Maiz Blanco ', 'Despensa', 42, 1.25, 0, 1, '1kg'),
('7592591000512', 'doña Emilia', 'Arroz tipo 1', 'Despensa', 46, 1.45, 0, 1, '1kg'),
('7592616362014', 'Kimiceg', 'Loratadina', 'Otro', 50, 2.00, 0, 1, '60ml'),
('7592632311300', 'Tapa Amarilla', 'Cloro', 'Cuidado Personal y Hogar', 50, 1.03, 0, 1, '500ml'),
('7592632311508', 'Tapa Amarilla', 'Cloro', 'Cuidado Personal y Hogar', 50, 1.31, 0, 1, '1L'),
('7592661000015', 'Glup!', 'Glup! Cola', 'Bebida no Alcolicas', 50, 1.31, 0, 1, '2L'),
('7592661002064', 'Glup!', 'Justy Durasno', 'Bebida no Alcolicas', 50, 0.45, 0, 1, '400ml'),
('7592661002910', 'Glup!', 'Justy Pera', 'Bebida no Alcolicas', 50, 1.25, 0, 1, '1.5L'),
('7592726007935', 'Hogme', 'Esponja Jabonosa', 'Cuidado Personal y Hogar', 50, 0.20, 0, 1, '1 unida'),
('7592811000445', 'Snacks Cometin', 'Palitos de Maiz', 'Snacks y Pasapalos', 50, 0.90, 0, 1, '60g'),
('7592811000469', 'Snacks Cometin', 'Bolitas de Maiz', 'Snacks y Pasapalos', 50, 0.90, 0, 1, '60g'),
('75930868', 'Mavesa', 'Mantequilla ', 'Despensa', 50, 2.07, 0, 1, '250g'),
('7593222000093', 'Arel', 'Guisantes', 'Despensa', 50, 2.10, 0, 1, '227g'),
('7593222000109', 'Arel', 'Vegetales Mixtos', 'Despensa', 50, 2.10, 0, 1, '227g'),
('7594007350556', 'El Aguila', 'Extrato de Fresa', 'Despensa', 50, 2.20, 0, 1, '230ml'),
('7594316793433', 'El Aguila', 'Jarabe Sabor a Granadina', 'Despensa', 50, 2.20, 0, 1, '330g'),
('7594369723593', 'El Aguila', 'Extracto de Chocolate', 'Despensa', 50, 2.20, 0, 1, '230ml'),
('7594369837290', 'El Aguila', 'Extracto de Uva', 'Despensa', 50, 2.20, 0, 1, '230ml'),
('7595461000315', 'Amanecer', 'cafe favorito ', 'Despensa', 50, 0.71, 0, 1, '50g'),
('7595461001206', 'Amanecer', 'Cafe Amanecer ', 'Despensa', 50, 1.60, 0, 1, '100g'),
('7595461001213', 'Amanecer', 'Cafe Della Nonna ', 'Despensa', 50, 1.60, 0, 1, '100g'),
('7595826007690', 'Osole', 'Maiz y Guisantes', 'Despensa', 50, 2.10, 0, 1, '280g'),
('7595826007713', 'Osole', 'Guisantes', 'Despensa', 50, 2.10, 0, 1, '280g'),
('7595826007737', 'Osole', 'Maiz Dulce', 'Despensa', 50, 2.00, 0, 1, '280g'),
('7596116001640', 'Blend Max', 'Cloro', 'Cuidado Personal y Hogar', 50, 4.90, 0, 1, '500ml'),
('7596273000876', 'Vale', 'Jabon en Polvo Limon', 'Cuidado Personal y Hogar', 50, 1.80, 0, 1, '400g'),
('7596273000883', 'Vale', 'Jabon en Polvo', 'Cuidado Personal y Hogar', 50, 1.80, 0, 1, '400g'),
('7596273000906', 'Vale', 'Jabon en Polvo Bebe', 'Cuidado Personal y Hogar', 50, 1.80, 0, 1, '400g'),
('7596470000075', 'La China', 'Salsa Agridulce ', 'Despensa', 50, 1.90, 0, 1, '150g'),
('7597089000036', 'Galletera Italia', 'Galletas Maria ', 'Despensa', 50, 0.84, 0, 1, '150g'),
('75971403', 'Mavesa', 'Mayonesa ', 'Despensa', 50, 2.67, 0, 1, '175g'),
('75971670', 'Las Llaves', 'Panela de jabon', 'Cuidado Personal y Hogar', 50, 1.19, 0, 1, '200g'),
('75971816', 'Nelly', 'Mantequilla ', 'Despensa', 50, 1.77, 0, 1, '250g'),
('75971939', 'Polar', 'Rikesa ', 'Despensa', 50, 4.60, 0, 1, '200g'),
('7597420000299', 'Relevo', 'Mal Portada', 'Bebida Alcolicas', 50, 6.00, 0, 1, '1.75L'),
('7597592303006', 'Amiko', 'Sobre Manila Carta', 'Otro', 50, 0.20, 0, 1, '230x300cm'),
('7597597000887', 'Baby Finger', 'Locion para Niños', 'Cuidado Personal y Hogar', 50, 1.50, 0, 1, '200ml'),
('7597597002195', 'Baby Finger', 'Pañales ', 'Cuidado Personal y Hogar', 50, 0.35, 0, 1, 'P'),
('7597597002201', 'Baby Finger', 'Pañales ', 'Cuidado Personal y Hogar', 50, 0.35, 0, 1, 'M'),
('7597597002225', 'Baby Finger', 'Pañales ', 'Cuidado Personal y Hogar', 50, 0.35, 0, 1, 'XG'),
('7597597002577', 'aliclean', 'Esponja', 'Otro', 50, 0.20, 0, 1, '8.8x5.8x3 cm'),
('7597688000093', 'Mi Princesa', 'Mi Princesa', 'Despensa', 50, 1.80, 0, 1, '900g'),
('7597743000150', 'Neptuno', 'Pisillo de Cazon', 'Despensa', 50, 2.80, 0, 1, ' 140g'),
('7597765000978', 'Kaly', 'Harina de Maiz Blanco ', 'Despensa', 50, 1.20, 0, 1, '900g'),
('7597786000100', 'Don Paco', 'Azucar', 'Despensa', 50, 1.71, 0, 1, '900g'),
('7598259000092', 'Damasco', 'Cafe Damasco ', 'Despensa', 50, 2.83, 0, 1, '200g'),
('7598259000153', 'Damasco', 'Cafe Damasco ', 'Despensa', 50, 0.80, 0, 1, '50g'),
('7598578000759', 'DAC55', 'amoxicilina', 'Otro', 50, 4.00, 0, 1, '60ml'),
('7598669002976', 'Caricias', 'Papel Higienico', 'Cuidado Personal y Hogar', 50, 0.44, 0, 1, '215 hojas'),
('7598669003072', 'Maple', 'Papel Higienico', 'Cuidado Personal y Hogar', 50, 0.44, 0, 1, '215 hojas'),
('7598874006073', 'Crisvi', 'Papel Crepe ', 'Otro', 50, 0.65, 0, 1, '50x200cm'),
('7598986000457', 'Tigo', 'Leche Evaporada ', 'Despensa', 50, 2.65, 0, 1, '354ml'),
('7598986002628', 'Tigo', 'Crema Chantilly en Polvo', 'Despensa', 50, 7.00, 0, 1, '400g'),
('7598986004363', 'Tigo', 'Chanti Tradicional', 'Despensa', 50, 6.60, 0, 1, '1L'),
('7598986005957', 'Tigo', 'Salsa Ahumada ', 'Despensa', 50, 3.00, 0, 1, '200g'),
('7599450000058', 'Amanecer', 'Maiz para Cotufas ', 'Despensa', 50, 1.48, 0, 1, '400g'),
('7599450000072', 'Amanecer', 'Lentejas', 'Despensa', 50, 2.19, 0, 1, ' 400g'),
('7599450000089', 'Amanecer', 'Caraotas Negras ', 'Despensa', 48, 1.43, 0, 1, '400g'),
('7599457000747', 'Health Medical', 'Jeringa Esteril ', 'Otro', 50, 0.20, 0, 1, '10cc/ml'),
('7599813000015', 'La Perla', 'Sal', 'Despensa', 50, 0.38, 0, 1, '1kg'),
('7599876000328', 'Snitch', 'Crunchis Gregory', 'Snacks y Pasapalos', 50, 1.68, 0, 1, '150g'),
('7599917144509', 'Viki viki', 'Azul Marino', 'Otro', 52, 1.00, 0, 1, '15g'),
('7599975000021', 'La Panpa ', 'Harina de Trigo Todo Uso', 'Despensa', 50, 0.82, 0, 1, '500g'),
('7702027444685', 'Nosotras', 'Tualla Sanitarias', 'Cuidado Personal y Hogar', 50, 1.66, 0, 1, '15 unidades'),
('7702111510814', 'Norma', 'cuaderno Cuadriculado', 'Otro', 50, 1.50, 0, 1, '1 unidad'),
('7702148000043', 'Reprograf', ' Hojas Blancas', 'Otro', 500, 0.02, 0, 1, '21.6x27.9cm'),
('7702184110188', 'Ecar', 'Metronidazol', 'Otro', 50, 1.87, 0, 1, '500mg'),
('7702310020886', 'LAK', 'Jabon de Baño', 'Cuidado Personal y Hogar', 50, 0.99, 0, 1, '110g'),
('7702354954888', 'Aromax', 'Limpia Pisos en Polvo', 'Otro', 50, 0.63, 0, 1, '10g'),
('7702354955113', 'Del Fogon', 'Caldo Trifogon', 'Despensa', 50, 0.10, 0, 1, '2.3g'),
('7702354955670', 'Boka', 'Durazno', 'Bebida no Alcolicas', 50, 0.40, 0, 1, '10g'),
('7702354955717', 'Boka', 'Maracuya', 'Bebida no Alcolicas', 50, 0.40, 0, 1, '10g'),
('7702425228504', 'Huggies', 'Pañales ', 'Cuidado Personal y Hogar', 50, 0.35, 0, 1, 'G'),
('7702425470798', 'Huggies', 'Shampoo', 'Cuidado Personal y Hogar', 50, 8.00, 0, 1, '400ml'),
('7703038040774', 'Laproff', 'Naproxeno', 'Otro', 50, 3.33, 0, 1, '250mg'),
('7703038065630', 'Laproff', 'Acetaminofen', 'Otro', 50, 5.00, 0, 1, '90ml'),
('7706569001603', 'Lafrancol', 'Ibuprofeno', 'Otro', 50, 1.60, 0, 1, '800mg'),
('7707014902988', 'Americandy', 'Big Bom Ta-Ta Ma cheri', 'Snacks y Pasapalos', 50, 0.20, 0, 1, '1 unidad'),
('7707294372990', 'inapel', 'cuaderno Cuadriculado', 'Otro', 50, 1.50, 0, 1, '1 unidad'),
('7707371215547', 'Max Hogar', 'Papel Aluminio', 'Otro', 50, 2.00, 0, 1, '8M'),
('7709901686599', 'Ideal', 'Aceite Vegetal de Palma ', 'Despensa', 48, 2.00, 0, 1, '394ml'),
('7791293043821', 'AXE', 'Desodorante Aerosol', 'Cuidado Personal y Hogar', 50, 8.00, 0, 1, '150ml'),
('7891122123585', 'Qualimax', 'Naranja', 'Bebida no Alcolicas', 50, 0.40, 0, 1, '15g'),
('7891122123622', 'Qualimax', 'Durazno', 'Bebida no Alcolicas', 50, 0.40, 0, 1, '15g'),
('7891122123639', 'Qualimax', 'Uva', 'Bebida no Alcolicas', 50, 0.40, 0, 1, '15g'),
('7891122123660', 'Qualimax', 'Salada de Frutas', 'Bebida no Alcolicas', 50, 0.40, 0, 1, '15g'),
('7896018700628', 'Huggies', 'Tuallitas Humedas', 'Cuidado Personal y Hogar', 50, 2.50, 0, 1, '48 unidades'),
('7896256605167', 'Tirol', 'Cremor ', 'Despensa', 50, 2.00, 0, 1, '395g'),
('8014002000519', 'OKI', 'Tuallitas Humedas', 'Cuidado Personal y Hogar', 50, 2.50, 0, 1, '50 unidades'),
('8020200000015', 'School ART', 'Papel Crepe Metalizado', 'Otro', 50, 0.65, 0, 1, '50x200cm'),
('8020200000039', 'School ART', 'Papel Crepe Perlado', 'Otro', 50, 0.65, 0, 1, '50x200cm'),
('8267657768260', 'Office Line', 'Papel Crepe ', 'Otro', 50, 0.40, 0, 1, '50x200cm'),
('8697449910575', 'Altunsa', 'Cola', 'Bebida no Alcolicas', 50, 0.35, 0, 1, '9g'),
('8801038200026', 'Dorco', 'Ojillas ', 'Cuidado Personal y Hogar', 50, 0.65, 0, 1, '5 unidades'),
('8993379108045', 'Anita', 'Jabon de Baño', 'Cuidado Personal y Hogar', 50, 0.76, 0, 1, '80g'),
('8993379259464', 'Popular', 'Panela de jabon', 'Cuidado Personal y Hogar', 50, 1.01, 0, 1, '150g'),
('9105022', 'Back to School', 'Fieltro Colores', 'Otro', 50, 0.35, 0, 1, '21.5x28cm'),
('9105046', 'Back to School', 'lana ', 'Otro', 50, 0.50, 0, 1, '12g'),
('9107640', 'Axces', 'Foamy', 'Otro', 50, 0.35, 0, 1, '22x28cm'),
('9555501463294', 'Econsave', 'Mascarilla', 'Otro', 50, 0.20, 0, 1, '1 unidad');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `C.I` int(20) NOT NULL,
  `NOMBRE` varchar(20) NOT NULL,
  `APELLIDO` varchar(20) NOT NULL,
  `N_USUARIO` varchar(20) NOT NULL,
  `CONTRASEÑA` varchar(300) NOT NULL,
  `ROL` varchar(20) NOT NULL,
  `telefono` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`C.I`, `NOMBRE`, `APELLIDO`, `N_USUARIO`, `CONTRASEÑA`, `ROL`, `telefono`) VALUES
(30766666, 'Eliezer', 'Guedez', 'eliezer guedez', '$2y$10$nd0f.pNFW4v7A4z63MgwC.ZHbdSYvR5Q5aFNgnbUugkutvgv4qXOu', 'gerente', '04125113952');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`c.i`);

--
-- Indices de la tabla `det_factura`
--
ALTER TABLE `det_factura`
  ADD PRIMARY KEY (`id_Det_factura`),
  ADD KEY `fk_factura` (`id_factura`),
  ADD KEY `fk_productos` (`codigo_producto`);

--
-- Indices de la tabla `factura`
--
ALTER TABLE `factura`
  ADD PRIMARY KEY (`id_factura`),
  ADD KEY `fk_cliente` (`ci_cliente`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`Codigo`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`C.I`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `det_factura`
--
ALTER TABLE `det_factura`
  MODIFY `id_Det_factura` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT de la tabla `factura`
--
ALTER TABLE `factura`
  MODIFY `id_factura` int(255) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `det_factura`
--
ALTER TABLE `det_factura`
  ADD CONSTRAINT `det_factura_ibfk_1` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `det_factura_ibfk_2` FOREIGN KEY (`codigo_producto`) REFERENCES `productos` (`Codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `factura`
--
ALTER TABLE `factura`
  ADD CONSTRAINT `factura_ibfk_2` FOREIGN KEY (`ci_cliente`) REFERENCES `clientes` (`c.i`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
