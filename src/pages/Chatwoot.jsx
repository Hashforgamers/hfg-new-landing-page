// src/pages/Chatwoot.js
import React, { useEffect } from "react";

const Chatwoot = () => {
  useEffect(() => {
    const BASE_URL = "https://app.chatwoot.com";
    const script = document.createElement("script");
    script.src = BASE_URL + "/packs/js/sdk.js";
    script.defer = true;
    script.async = true;
    script.onload = () => {
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken: "aQksSY9KYwvwLDe8qvFFmRWu",
          baseUrl: BASE_URL,
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return (
    <div
      style={{
        backgroundColor: "#0e0e0e",
        color: "#00ffe1",
        fontFamily: "'Courier New', Courier, monospace",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
      }}
    >
      <h1 style={{ fontSize: 18, textAlign: "center" }}>
        Connecting to HashForGamers Support...
      </h1>
    </div>
  );
};

export default Chatwoot;
