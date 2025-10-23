/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

/**
 * Filter stores within radius
 * @param {Array} stores - Array of store objects with latitude and longitude
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Array} Filtered stores with distance property
 */
const filterStoresByRadius = (stores, userLat, userLon, radiusKm) => {
  return stores
    .map(store => {
      const distance = calculateDistance(
        userLat,
        userLon,
        parseFloat(store.latitude),
        parseFloat(store.longitude)
      );
      return { ...store.toJSON(), distance };
    })
    .filter(store => store.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = {
  calculateDistance,
  filterStoresByRadius
};
