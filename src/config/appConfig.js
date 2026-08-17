export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || "Calibration",
  apiUrl: import.meta.env.VITE_API_URL || "/api",
  pagination: {
    defaultPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100]
  }
};
