import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "./views/Dashboard.vue";
import RoomsManager from "./views/RoomsManager.vue";
import GuestsManager from "./views/GuestsManager.vue";
import BookingsManager from "./views/BookingsManager.vue";
import ServicesManager from "./views/ServicesManager.vue";
import AvatarTest from "./views/AvatarTest.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/rooms", component: RoomsManager },
  { path: "/guests", component: GuestsManager },
  { path: "/bookings", component: BookingsManager },
  { path: "/services", component: ServicesManager },
  { path: "/avatar-test", component: AvatarTest },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
