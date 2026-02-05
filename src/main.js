import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import langPlugin from "./plugins/langPlugin.js";

const app = createApp(App);

app.use(router);
app.use(langPlugin);

app.mount("#app");
