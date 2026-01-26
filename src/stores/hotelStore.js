import { reactive } from "vue";

export const hotelStore = reactive({
  // Dummy data cho phòng
  rooms: [
    { id: 1, number: "101", type: "Single", status: "Available", price: 1500000, guest: "" },
    { id: 2, number: "102", type: "Double", status: "Occupied", price: 2500000, guest: "Nguyễn Văn A" },
    { id: 3, number: "103", type: "Suite", status: "Available", price: 5000000, guest: "" },
    { id: 4, number: "201", type: "Double", status: "Maintenance", price: 2500000, guest: "" },
    { id: 5, number: "202", type: "Single", status: "Occupied", price: 1500000, guest: "Trần Thị B" },
    { id: 6, number: "203", type: "Suite", status: "Available", price: 5000000, guest: "" },
    { id: 7, number: "301", type: "Double", status: "Available", price: 2500000, guest: "" },
    { id: 8, number: "302", type: "Single", status: "Occupied", price: 1500000, guest: "Lê Văn C" },
  ],

  // Dummy data cho khách hàng
  guests: [
    { id: 1, name: "Nguyễn Văn A", email: "nguyena@email.com", phone: "0901234567", room: "102", checkIn: "2026-01-20", checkOut: "2026-01-27" },
    { id: 2, name: "Trần Thị B", email: "tranb@email.com", phone: "0912345678", room: "202", checkIn: "2026-01-22", checkOut: "2026-01-29" },
    { id: 3, name: "Lê Văn C", email: "levanc@email.com", phone: "0923456789", room: "302", checkIn: "2026-01-25", checkOut: "2026-01-30" },
    { id: 4, name: "Phạm Thị D", email: "phamd@email.com", phone: "0934567890", room: "", checkIn: "2026-02-01", checkOut: "2026-02-05" },
  ],

  // Dummy data cho đặt phòng
  bookings: [
    { id: 1, guestName: "Nguyễn Văn A", roomNumber: "102", checkIn: "2026-01-20", checkOut: "2026-01-27", totalPrice: 10500000, status: "Checked In" },
    { id: 2, guestName: "Trần Thị B", roomNumber: "202", checkIn: "2026-01-22", checkOut: "2026-01-29", totalPrice: 10500000, status: "Checked In" },
    { id: 3, guestName: "Lê Văn C", roomNumber: "302", checkIn: "2026-01-25", checkOut: "2026-01-30", totalPrice: 12500000, status: "Checked In" },
    { id: 4, guestName: "Phạm Thị D", roomNumber: "", checkIn: "2026-02-01", checkOut: "2026-02-05", totalPrice: 7500000, status: "Pending" },
  ],

  // Dummy data cho dịch vụ
  services: [
    { id: 1, name: "Ăn sáng", price: 300000, description: "Bữa sáng theo phong cách Âu Á" },
    { id: 2, name: "Spa", price: 500000, description: "Dịch vụ spa toàn thân" },
    { id: 3, name: "Giặt ủi", price: 150000, description: "Dịch vụ giặt ủi quần áo" },
    { id: 4, name: "Vận chuyển", price: 200000, description: "Dịch vụ taxi sân bay" },
  ],

  // Thêm phòng mới
  addRoom(room) {
    const newRoom = {
      id: Math.max(...this.rooms.map((r) => r.id), 0) + 1,
      ...room,
      status: "Available",
    };
    this.rooms.push(newRoom);
    return newRoom;
  },

  // Xóa phòng
  deleteRoom(id) {
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index > -1) {
      this.rooms.splice(index, 1);
    }
  },

  // Cập nhật phòng
  updateRoom(id, updates) {
    const room = this.rooms.find((r) => r.id === id);
    if (room) {
      Object.assign(room, updates);
    }
  },

  // Thêm khách hàng
  addGuest(guest) {
    const newGuest = {
      id: Math.max(...this.guests.map((g) => g.id), 0) + 1,
      ...guest,
    };
    this.guests.push(newGuest);
    return newGuest;
  },

  // Xóa khách hàng
  deleteGuest(id) {
    const index = this.guests.findIndex((g) => g.id === id);
    if (index > -1) {
      this.guests.splice(index, 1);
    }
  },

  // Cập nhật khách hàng
  updateGuest(id, updates) {
    const guest = this.guests.find((g) => g.id === id);
    if (guest) {
      Object.assign(guest, updates);
    }
  },

  // Thêm đặt phòng
  addBooking(booking) {
    const newBooking = {
      id: Math.max(...this.bookings.map((b) => b.id), 0) + 1,
      ...booking,
      status: "Pending",
    };
    this.bookings.push(newBooking);
    return newBooking;
  },

  // Xóa đặt phòng
  deleteBooking(id) {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index > -1) {
      this.bookings.splice(index, 1);
    }
  },

  // Cập nhật đặt phòng
  updateBooking(id, updates) {
    const booking = this.bookings.find((b) => b.id === id);
    if (booking) {
      Object.assign(booking, updates);
    }
  },

  // Thêm dịch vụ
  addService(service) {
    const newService = {
      id: Math.max(...this.services.map((s) => s.id), 0) + 1,
      ...service,
    };
    this.services.push(newService);
    return newService;
  },

  // Xóa dịch vụ
  deleteService(id) {
    const index = this.services.findIndex((s) => s.id === id);
    if (index > -1) {
      this.services.splice(index, 1);
    }
  },

  // Cập nhật dịch vụ
  updateService(id, updates) {
    const service = this.services.find((s) => s.id === id);
    if (service) {
      Object.assign(service, updates);
    }
  },
});
