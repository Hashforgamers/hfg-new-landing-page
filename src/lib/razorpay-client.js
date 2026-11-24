/*
 * Loads Razorpay Checkout on demand and resolves with the payment result.
 * The client callback is NOT proof of payment: the gateway re-verifies the
 * signature and the backends fetch the payment from Razorpay before
 * confirming anything.
 */

let loader = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Razorpay) return Promise.resolve();
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        loader = null;
        reject(new Error("Could not load the payment window. Check your connection."));
      };
      document.head.appendChild(s);
    });
  }
  return loader;
}

/**
 * Resolves { status: 'paid', paymentId, orderId, signature }
 *       or { status: 'dismissed' } / { status: 'failed', reason }.
 */
export async function openRazorpay(checkout) {
  await loadScript();
  if (!checkout?.key) throw new Error("Online payment isn't configured yet.");
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => {
      if (!settled) {
        settled = true;
        resolve(value);
      }
    };
    const rzp = new window.Razorpay({
      key: checkout.key,
      order_id: checkout.orderId,
      amount: checkout.amount,
      currency: checkout.currency || "INR",
      name: checkout.name,
      description: checkout.description,
      prefill: checkout.prefill,
      theme: { color: "#16FF00", backdrop_color: "#000000" },
      retry: { enabled: true, max_count: 3 },
      modal: {
        confirm_close: true,
        ondismiss: () => done({ status: "dismissed" }),
      },
      handler: (resp) =>
        done({
          status: "paid",
          paymentId: resp.razorpay_payment_id,
          orderId: resp.razorpay_order_id,
          signature: resp.razorpay_signature,
        }),
    });
    rzp.on("payment.failed", (resp) => {
      // Razorpay lets the user retry inside the modal; we only record it.
      void resp;
    });
    rzp.open();
  });
}
