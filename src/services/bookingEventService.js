import { hotelStore } from "../stores/hotelStore";

/**
 * Get all booking events by booking ID (simulated API call)
 * @param {string} bookingId - The booking ID
 * @returns {Promise<Array>} Array of booking events
 */
export const getBookingEventsByBookingId = async (bookingId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const events = hotelStore.getBookingEventsByBookingId(bookingId);
      resolve(events || []);
    }, 3000); // Simulate 300ms network delay
  });
};

/**
 * Get booking events by booking ID with pagination (simulated API call)
 * @param {string} bookingId - The booking ID
 * @param {number} lastEventId - The last event ID (for pagination cursor)
 * @param {number} limit - Number of events to fetch
 * @returns {Promise<object>} Object with events array and hasMore flag
 */
export const getBookingEventsByBookingIdPaginated = async (bookingId, lastEventId, limit = 5) => {
  console.log("Fetching paginated events for bookingId:", bookingId, "lastEventId:", lastEventId, "limit:", limit);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Get all events for this booking and sort by date (earliest first)
      let events = hotelStore.bookingEvents.filter((event) => event.bookingId === bookingId).sort((a, b) => new Date(a.date) - new Date(b.date));
      let hasMore = false;
      let datas = [];
      for (let i = 0; i < events.length; i++) {
        hasMore = i < events.length - 1;
        const event = events[i];
        if (lastEventId == null || event.id > lastEventId) {
          datas.push(event);
          if (datas.length >= limit) {
            break;
          }
        }
      }

      console.log("Paginated fetch:", { eventLength: events.length, returnedLength: datas.length, hasMore });
      resolve({ events: datas, hasMore });
    }, 500); // Simulate 500ms network delay
  });
};

/**
 * Add a new booking event (simulated API call)
 * @param {object} eventData - The event data
 * @returns {Promise<object>} Created event
 */
export const addBookingEvent = async (eventData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validate required fields
        if (!eventData.bookingId || !eventData.type || !eventData.title) {
          throw new Error("Missing required fields: bookingId, type, or title");
        }

        // Create new event with ID
        const newEventId = Math.max(...hotelStore.bookingEvents.map((e) => e.id), 0) + 1;
        const newEvent = {
          id: newEventId,
          ...eventData,
          date: eventData.date || new Date().toLocaleString("vi-VN"),
        };

        // Add to store
        hotelStore.bookingEvents.push(newEvent);
        resolve(newEvent);
      } catch (error) {
        reject(error);
      }
    }, 300); // Simulate 300ms network delay
  });
};

/**
 * Update a booking event (simulated API call)
 * @param {number} eventId - The event ID
 * @param {object} updates - The updates to apply
 * @returns {Promise<object>} Updated event
 */
export const updateBookingEvent = async (eventId, updates) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const event = hotelStore.bookingEvents.find((e) => e.id === eventId);
        if (!event) {
          throw new Error("Event not found");
        }

        // Update the event
        Object.assign(event, updates);
        resolve(event);
      } catch (error) {
        reject(error);
      }
    }, 300); // Simulate 300ms network delay
  });
};

/**
 * Delete a booking event (simulated API call)
 * @param {number} eventId - The event ID
 * @returns {Promise<object>} Result of deletion
 */
export const deleteBookingEvent = async (eventId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const index = hotelStore.bookingEvents.findIndex((e) => e.id === eventId);
        if (index === -1) {
          throw new Error("Event not found");
        }

        hotelStore.bookingEvents.splice(index, 1);
        resolve({ success: true, message: "Event deleted successfully" });
      } catch (error) {
        reject(error);
      }
    }, 300); // Simulate 300ms network delay
  });
};

/**
 * Create check-in event (simulated API call)
 * @param {string} bookingId - The booking ID
 * @returns {Promise<object>} Created check-in event
 */
export const createCheckInEvent = async (bookingId) => {
  return addBookingEvent({
    bookingId,
    type: "checkin",
    icon: "🔓",
    title: "Khách check-in",
    description: "Check-in phòng",
    date: new Date().toLocaleString("vi-VN"),
    amount: null,
  });
};

/**
 * Create check-out event (simulated API call)
 * @param {string} bookingId - The booking ID
 * @returns {Promise<object>} Created check-out event
 */
export const createCheckOutEvent = async (bookingId) => {
  return addBookingEvent({
    bookingId,
    type: "checkout",
    icon: "🔐",
    title: "Khách check-out",
    description: "Check-out phòng",
    date: new Date().toLocaleString("vi-VN"),
    amount: null,
  });
};

/**
 * Create payment event (simulated API call)
 * @param {string} bookingId - The booking ID
 * @param {number} amount - The payment amount
 * @param {string} description - The payment description
 * @returns {Promise<object>} Created payment event
 */
export const createPaymentEvent = async (bookingId, amount, description = "Thanh toán") => {
  return addBookingEvent({
    bookingId,
    type: "payment",
    icon: "💳",
    title: "Khách thanh toán",
    description,
    date: new Date().toLocaleString("vi-VN"),
    amount,
  });
};

/**
 * Create service usage event (simulated API call)
 * @param {string} bookingId - The booking ID
 * @param {string} serviceName - The service name
 * @param {number} price - The service price
 * @returns {Promise<object>} Created service event
 */
export const createServiceEvent = async (bookingId, serviceName, price) => {
  return addBookingEvent({
    bookingId,
    type: "service_used",
    icon: "🍹",
    title: `Khách dùng dịch vụ "${serviceName}"`,
    description: "Chưa thanh toán",
    date: new Date().toLocaleString("vi-VN"),
    amount: price,
  });
};
