import { useEffect, useState } from "react";
import { subscribeToast } from "../src/lib/toast";

const DISMISS_MS = 3200;

export default function ToastHost() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeToast((toastItem) => {
      setItems((prev) => [...prev, toastItem]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== toastItem.id));
      }, DISMISS_MS);
    });
  }, []);

  if (!items.length) return null;

  return (
    <div className="toast-host" aria-live="polite" aria-relevant="additions">
      {items.map((item) => (
        <div
          key={item.id}
          className={`toast-item toast-item--${item.type}`}
          role="status"
        >
          {item.message}
        </div>
      ))}
    </div>
  );
}
