import { languageController } from "../controller/languageController.js";
import { langVN } from "../locales/vi.js";

// Initialize language
languageController.setLanguage(langVN);

export default {
  install(app) {
    app.config.globalProperties.$lang = languageController;
  },
};
