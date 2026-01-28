import { hotelStore as store } from "../stores/hotelStore";

/**
 * Search guests by name or citizen ID
 * @param {string} query - Search query (name or citizen ID)
 * @param {number} limit - Maximum number of results (default: 10 if no query, unlimited if query provided)
 * @returns {Promise<Array>} Array of matching guests
 */
export const searchGuests = async (query, limit = null) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        let results;
        if (!query.trim()) {
          results = store.guests;
          // Default limit 10 if no query
          if (limit === null) {
            limit = 10;
          }
        } else {
          const searchQuery = query.toLowerCase();
          results = store.guests.filter((guest) => guest.name.toLowerCase().includes(searchQuery) || guest.citizenId.toLowerCase().includes(searchQuery));
        }

        // Apply limit if specified
        if (limit && limit > 0) {
          results = results.slice(0, limit);
        }

        resolve(results);
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};

/**
 * Get top 10 guests
 * @returns {Promise<Array>} Array of top 10 guests
 */
export const getTopGuests = async () => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        const topGuests = store.guests.slice(0, 10);
        resolve(topGuests);
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};

/**
 * Get all guests
 * @returns {Promise<Array>} Array of all guests
 */
export const getAllGuests = async () => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        resolve(store.guests);
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};

/**
 * Get guest by ID
 * @param {number} id - Guest ID
 * @returns {Promise<Object>} Guest object or null
 */
export const getGuestById = async (id) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        const guest = store.guests.find((g) => g.id === id);
        resolve(guest || null);
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};

/**
 * Create new guest
 * @param {Object} guestData - Guest data
 * @returns {Promise<Object>} Created guest object
 */
export const createGuest = async (guestData) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        const newGuest = {
          id: Math.max(...store.guests.map((g) => g.id), 0) + 1,
          ...guestData,
        };

        store.addGuest(newGuest);
        resolve(newGuest);
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};

/**
 * Update guest
 * @param {number} id - Guest ID
 * @param {Object} guestData - Updated guest data
 * @returns {Promise<Object>} Updated guest object
 */
export const updateGuest = async (id, guestData) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        const guestIndex = store.guests.findIndex((g) => g.id === id);
        if (guestIndex !== -1) {
          store.guests[guestIndex] = { ...store.guests[guestIndex], ...guestData };
          resolve(store.guests[guestIndex]);
        } else {
          resolve(null);
        }
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};

/**
 * Delete guest
 * @param {number} id - Guest ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteGuest = async (id) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        store.deleteGuest(id);
        resolve(true);
      },
      Math.random() * 1000 + 1000,
    ); // Simulate 1-2 second network delay
  });
};
