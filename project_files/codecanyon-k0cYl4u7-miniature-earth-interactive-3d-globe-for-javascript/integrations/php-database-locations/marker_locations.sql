CREATE TABLE `marker_locations` (
  `id` int(11) NOT NULL,
  `title` varchar(200) CHARACTER SET utf8 NOT NULL,
  `lat` float NOT NULL,
  `lng` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `marker_locations` (`id`, `title`, `lat`, `lng`) VALUES
(1, 'Stockholm, Sweden', 59.651, 17.918),
(2, 'Bangkok, Thailand', 13.681, 100.747),
(3, 'Cairo, Egypt', 30.121, 31.405),
(4, 'Jakarta, Indonesia', -6.125, 106.655),
(5, 'Cape Town, South Africa', -33.964, 18.601),
(6, 'Delhi, India', 28.566, 77.103),
(7, 'Dubai, UAE', 25.252, 55.364),
(8, 'Buenos Aires, Argentina', -34.822, -58.535),
(9, 'Rome, Italy', 41.8, 12.238),
(10, 'Hong Kong', 22.308, 113.915),
(11, 'Tokyo, Japan', 35.552, 139.779),
(12, 'Hawaii, USA', 21.318, -157.921),
(13, 'New York, USA', 40.639, -73.778),
(14, 'Los Angeles, USA', 33.942, -118.407),
(15, 'Lima, Peru', -12.021, -77.114),
(16, 'London, UK', 51.47, -0.461),
(17, 'Madrid, Spain', 40.471, -3.562),
(18, 'Mexico', 19.436, -99.072),
(19, 'Miami, USA', 25.793, -80.29),
(20, 'Nairobi, Kenya', -1.319, 36.927),
(21, 'Chicago, USA', 41.978, -87.904),
(22, 'Beijing, China', 40.08, 116.584),
(23, 'Shanghai, China', 31.143, 121.805),
(24, 'Singapore', 1.35, 103.994),
(25, 'Sydney, Australia', -33.946, 151.177),
(26, 'Santiago, Chile', -33.393, -70.785),
(27, 'Rio de Janeiro, Brazil', -22.91, -43.163),
(28, 'Moscow, Russia', 55.591, 37.261),
(29, 'Wellington, New Zealand', -41.327, 174.804),
(30, 'Vancouver, Canada', 49.193, -123.183);

ALTER TABLE `marker_locations`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `marker_locations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;
  