import { reactive } from "vue";

export const hotelStore = reactive({
  // Dummy data cho phòng
  rooms: [
    { id: 1, number: "8001", type: "Single", status: "Available", priceHourly: 200000, priceDaily: 600000, guest: "", group: "Tòa A" },
    { id: 2, number: "8101", type: "Single", status: "Occupied", priceHourly: 200000, priceDaily: 600000, guest: "Nguyễn Văn A", group: "Tòa A" },
    { id: 3, number: "8201", type: "Single", status: "Available", priceHourly: 200000, priceDaily: 600000, guest: "", group: "Tòa A" },
    { id: 4, number: "8202", type: "Double", status: "Cleaning", priceHourly: 300000, priceDaily: 900000, guest: "", group: "Tòa A" },
    { id: 5, number: "8301", type: "Single", status: "Occupied", priceHourly: 200000, priceDaily: 600000, guest: "Trần Thị B", group: "Tòa A" },
    { id: 6, number: "8302", type: "Double", status: "Available", priceHourly: 300000, priceDaily: 900000, guest: "", group: "Tòa A" },
    { id: 7, number: "8401", type: "Double", status: "Available", priceHourly: 300000, priceDaily: 900000, guest: "", group: "Tòa A" },
    { id: 8, number: "9101", type: "Single", status: "Occupied", priceHourly: 200000, priceDaily: 600000, guest: "Lê Văn C", group: "Tòa B" },
    { id: 9, number: "9201", type: "Single", status: "Available", priceHourly: 200000, priceDaily: 600000, guest: "", group: "Tòa B" },
    { id: 10, number: "9202", type: "Double", status: "Cleaning", priceHourly: 300000, priceDaily: 900000, guest: "", group: "Tòa B" },
    { id: 11, number: "9301", type: "Single", status: "Occupied", priceHourly: 200000, priceDaily: 600000, guest: "Phạm Thị D", group: "Tòa B" },
    { id: 12, number: "9302", type: "Double", status: "Available", priceHourly: 300000, priceDaily: 900000, guest: "", group: "Tòa B" },
    { id: 13, number: "9401", type: "Single", status: "Available", priceHourly: 200000, priceDaily: 600000, guest: "", group: "Tòa B" },
  ],

  // Dummy data cho khách hàng
  guests: [
    {
      id: "guest_1",
      name: "Nguyễn Văn A",
      email: "nguyena@email.com",
      phone: "0901234567",
      citizenId: "001234567890",
      nationality: "Việt Nam",
      rentalCount: 5,
      dateOfBirth: "1985-03-15",
      createdAt: "2024-01-10",
      lastRentalDate: "2026-01-27",
      imageUrl: "",
    },
    {
      id: "guest_2",
      name: "Trần Thị B",
      email: "tranb@email.com",
      phone: "0912345678",
      citizenId: "002345678901",
      nationality: "Việt Nam",
      rentalCount: 3,
      dateOfBirth: "1990-07-22",
      createdAt: "2024-02-15",
      lastRentalDate: "2026-01-29",
      imageUrl: "",
    },
    {
      id: "guest_3",
      name: "Lê Văn C",
      email: "levanc@email.com",
      phone: "0923456789",
      citizenId: "003456789012",
      nationality: "Trung Quốc",
      rentalCount: 2,
      dateOfBirth: "1988-11-08",
      createdAt: "2024-03-20",
      lastRentalDate: "2026-01-30",
      imageUrl: "",
    },
    {
      id: "guest_4",
      name: "Phạm Thị D",
      email: "phamd@email.com",
      phone: "0934567890",
      citizenId: "004567890123",
      nationality: "Việt Nam",
      rentalCount: 1,
      dateOfBirth: "1995-05-18",
      createdAt: "2025-01-15",
      lastRentalDate: "2026-01-15",
      imageUrl: "",
    },
  ],

  // Dummy data cho đặt phòng
  bookings: [
    {
      id: "booking_1",
      guestId: "guest_1",
      accompaniedGuestIds: ["guest_2", "guest_3"],
      roomNumber: "8001",
      checkIn: "2026-01-20 12:00",
      checkOut: "2026-01-27 12:00",
      bookingType: "daily",
      pricePerUnit: 600000,
      totalPrice: 10500000,
      totalPrepayment: 5000000,
      status: "Checked In",
    },
    {
      id: "booking_2",
      guestId: "guest_2",
      accompaniedGuestIds: [],
      roomNumber: "8301",
      checkIn: "2026-01-22 12:00",
      checkOut: "2026-01-29 12:00",
      bookingType: "daily",
      pricePerUnit: 600000,
      totalPrice: 10500000,
      totalPrepayment: 3000000,
      status: "Checked In",
    },
    {
      id: "booking_3",
      guestId: "guest_3",
      accompaniedGuestIds: ["guest_4", "guest_1"],
      roomNumber: "9101",
      checkIn: "2026-01-25 12:00",
      checkOut: "2026-01-30 12:00",
      bookingType: "daily",
      pricePerUnit: 600000,
      totalPrice: 12500000,
      totalPrepayment: 600000,
      status: "Checked In",
    },
    {
      id: "booking_4",
      guestId: "guest_4",
      accompaniedGuestIds: [],
      roomNumber: "",
      checkIn: "2026-02-01 12:00",
      checkOut: "2026-02-05 12:00",
      bookingType: "daily",
      pricePerUnit: 600000,
      totalPrice: 7500000,
      totalPrepayment: 2500000,
      status: "Pending",
    },
  ],

  // Dummy data cho dịch vụ
  services: [
    { id: 1, name: "Ăn sáng", price: 300000, description: "Bữa sáng theo phong cách Âu Á" },
    { id: 2, name: "Spa", price: 500000, description: "Dịch vụ spa toàn thân" },
    { id: 3, name: "Giặt ủi", price: 150000, description: "Dịch vụ giặt ủi quần áo" },
    { id: 4, name: "Vận chuyển", price: 200000, description: "Dịch vụ taxi sân bay" },
  ],

  // Dummy data cho khách trả tiền trước
  prepayments: [
    {
      id: 1,
      bookingId: "booking_1",
      amount: 5000000,
      paymentDate: "2026-01-15 10:30",
      paymentMethod: "Chuyển khoản",
      description: "Trả tiền trước 50%",
      status: "Completed",
    },
    {
      id: 2,
      bookingId: "booking_2",
      amount: 3000000,
      paymentDate: "2026-01-18 14:15",
      paymentMethod: "Tiền mặt",
      description: "Trả tiền trước 30%",
      status: "Completed",
    },
    {
      id: 3,
      bookingId: "booking_3",
      amount: 6000000,
      paymentDate: "2026-01-20 09:00",
      paymentMethod: "Thẻ tín dụng",
      description: "Trả tiền trước 50%",
      status: "Completed",
    },
    {
      id: 4,
      bookingId: "booking_4",
      amount: 2500000,
      paymentDate: "2026-01-28 16:45",
      paymentMethod: "Chuyển khoản",
      description: "Trả tiền trước 33%",
      status: "Pending",
    },
  ],

  // Lịch sử sự kiện đặt phòng (Timeline events)
  bookingEvents: [
    // Booking 1 events
    {
      id: 1,
      bookingId: "booking_1",
      type: "booking_created",
      icon: "📋",
      title: "Khách đặt phòng",
      description: "Đặt phòng 8001",
      date: "2025-12-01 06:00",
      amount: null,
    },
    {
      id: 2,
      bookingId: "booking_1",
      type: "payment",
      icon: "💳",
      title: "Khách trả tiền mặt",
      description: "Trả tiền trước",
      date: "2025-12-01 06:01",
      amount: 5000000,
    },
    {
      id: 3,
      bookingId: "booking_1",
      type: "checkin",
      icon: "🔓",
      title: "Khách check-in",
      description: "Check-in phòng 8001",
      date: "2025-12-01 06:02",
      amount: null,
    },
    {
      id: 4,
      bookingId: "booking_1",
      type: "service_used",
      icon: "🍹",
      title: "Khách dùng dịch vụ Nước ngọt",
      description: "Chưa thanh toán",
      date: "2025-12-01 08:00",
      amount: 40000,
    },
    {
      id: 5,
      bookingId: "booking_1",
      type: "checkout",
      icon: "🔐",
      title: "Khách check-out",
      description: "Check-out phòng 8001",
      date: "2025-12-02 06:00",
      amount: null,
    },
    {
      id: 6,
      bookingId: "booking_1",
      type: "payment",
      icon: "💰",
      title: "Khách thanh toán dịch vụ",
      description: "Trả tiền dịch vụ",
      date: "2025-12-02 06:01",
      amount: 40000,
    },
    {
      id: 7,
      bookingId: "booking_1",
      type: "booking_completed",
      icon: "✅",
      title: "Đặt phòng hoàn tất",
      description: "Tất cả các khoản thanh toán đã xong",
      date: "2025-12-02 06:02",
      amount: null,
    },
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
    const maxId = Math.max(
      ...this.guests.map((g) => {
        const num = parseInt(g.id.replace("guest_", ""));
        return isNaN(num) ? 0 : num;
      }),
      0,
    );
    const newGuest = {
      id: `guest_${maxId + 1}`,
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
      accompaniedGuestIds: booking.accompaniedGuestIds || [],
      bookingType: booking.bookingType || "daily",
      pricePerUnit: booking.pricePerUnit || 0,
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

  // Thêm trả tiền trước
  addPrepayment(prepayment) {
    const newPrepayment = {
      id: Math.max(...this.prepayments.map((p) => p.id), 0) + 1,
      ...prepayment,
      status: prepayment.status || "Completed",
    };
    this.prepayments.push(newPrepayment);
    return newPrepayment;
  },

  // Xóa trả tiền trước
  deletePrepayment(id) {
    const index = this.prepayments.findIndex((p) => p.id === id);
    if (index > -1) {
      this.prepayments.splice(index, 1);
    }
  },

  // Cập nhật trả tiền trước
  updatePrepayment(id, updates) {
    const prepayment = this.prepayments.find((p) => p.id === id);
    if (prepayment) {
      Object.assign(prepayment, updates);
    }
  },

  // Lấy danh sách trả tiền trước theo bookingId
  getPrepaymentsByBookingId(bookingId) {
    return this.prepayments.filter((p) => p.bookingId === bookingId);
  },

  // Tính tổng tiền trả trước theo bookingId
  getTotalPrepaidByBookingId(bookingId) {
    return this.prepayments.filter((p) => p.bookingId === bookingId && p.status === "Completed").reduce((sum, p) => sum + p.amount, 0);
  },

  // Lấy danh sách sự kiện đặt phòng theo bookingId
  getBookingEventsByBookingId(bookingId) {
    return this.bookingEvents.filter((e) => e.bookingId === bookingId).sort((a, b) => new Date(a.date) - new Date(b.date));
  },
});
