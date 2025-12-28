import DefaultTheme from "vitepress/theme";
import { h, onMounted, watch } from "vue";
import { useRoute } from "vitepress";
import FlickeringGrid from "./components/FlickeringGrid.vue";
import AdminDashboard from "./components/AdminDashboard.vue";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      "home-hero-image": () => h(FlickeringGrid),
    });
  },
  enhanceApp({ app }: { app: any }) {
    app.component("AdminDashboard", AdminDashboard);
  },
  setup() {
    const route = useRoute();

    // Simple simulated Web Analytics
    // In a real app, this would send a POST request to your backend
    const trackPageView = (path: string) => {
      console.log(`[Analytics] Page View: ${path} | OS: ${navigator.platform}`);
      // Example: fetch('https://your-api.com/analytics/view', { method: 'POST', body: JSON.stringify({ path, ua: navigator.userAgent }) })
    };

    onMounted(() => {
      trackPageView(route.path);
    });

    watch(
      () => route.path,
      (newPath: string) => {
        trackPageView(newPath);
      }
    );
  },
};
