import { hotelStore as store } from "../stores/hotelStore";

/**
 * Get guests with pagination and search
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-based)
 * @param {number} options.pageSize - Items per page (default: 10)
 * @param {string} options.search - Search query (name or citizenId)
 * @returns {Promise<Object>} Object with guests, total, and pagination info
 */
export const getGuestsPaginated = async (options = {}) => {
  const { page = 1, pageSize = 10, search = "" } = options;

  // Dummy API call - replace with real API later
  return new Promise((resolve) => {
    setTimeout(
      () => {
        let results = store.guests;

        // Filter by search query
        if (search.trim()) {
          const searchQuery = search.toLowerCase();
          results = results.filter((guest) => guest.name.toLowerCase().includes(searchQuery) || guest.citizenId.toLowerCase().includes(searchQuery));
        }

        const total = results.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedResults = results.slice(startIndex, endIndex);

        resolve({
          data: paginatedResults,
          total: total,
          page: page,
          pageSize: pageSize,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        });
      },
      Math.random() * 1000 + 500,
    ); // Simulate 0.5-1.5 second network delay
  });
};

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
    setTimeout(() => {
      const guest = store.guests.find((g) => g.id === id);
      resolve(guest || null);
    }, 3000); // Simulate 1-2 second network delay
  });
};

/**
 * Create new guest
 * @param {Object} guestData - Guest data
 * @returns {Promise<Object>} Created guest object
 */
export const createGuest = async (guestData) => {
  // Dummy API call - replace with real API later
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        try {
          if (store.guests.some((g) => g.citizenId === guestData.citizenId)) {
            throw new Error("duplicateCitizenId");
          }

          const newGuest = {
            id: "guest_" + Date.now(),
            ...guestData,
          };

          store.addGuest(newGuest);
          resolve(newGuest);
        } catch (error) {
          reject(error.message);
        }
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
