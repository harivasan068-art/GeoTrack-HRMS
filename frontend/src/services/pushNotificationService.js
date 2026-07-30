export const pushNotificationService = {
  isSupported: () => {
    return "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
  },

  getPermissionState: () => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission; // 'granted', 'denied', or 'default'
  },

  requestPermission: async () => {
    if (!("Notification" in window)) {
      console.warn("Notifications not supported in this browser");
      return "unsupported";
    }
    const permission = await Notification.requestPermission();
    return permission;
  },

  subscribeUser: async (publicVapidKey) => {
    if (!("serviceWorker" in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription && publicVapidKey) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicVapidKey,
        });
      }
      return subscription;
    } catch (e) {
      console.warn("Push subscription failed:", e);
      return null;
    }
  },
};
