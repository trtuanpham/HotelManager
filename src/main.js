import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router.js";
import { languageController } from "./controller/languageController.js";
import { langVN } from "./locales/vi.js";

// Initialize language
languageController.setLanguage(langVN);

const app = createApp(App);

app.use(router);
app.mount("#app");
