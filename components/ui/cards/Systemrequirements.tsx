import React from "react";
import Image from "next/image";
export default function System_requirements() {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          flexWrap: "wrap",
          paddingTop: "100px",
          gap: "40px",
          justifyContent: "center",
        }}
      >
        {/* Windows колонка */}
        <div
          style={{
            flex: "1",
            minWidth: "50%",
            maxWidth: "80%",
            backgroundColor: "#2a2a2a",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "#333",
              padding: "40px",
              paddingBottom: "20px",
              textAlign: "center",
              display: "flex",
            }}
          >
            <h3
              style={{
                margin: "0",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#fff",
                borderBottom: "3px solid #26baff",
                paddingBottom: "10px",
              }}
            >
              Рекомендовані системні вимоги
            </h3>
          </div>

          <div style={{ padding: "40px" }}>
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                color: "#ccc",
                fontWeight: "600",
              }}
            >
              Minimax
            </h3>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #444",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                OS version
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                Win10 64-bits
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #444",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                CPU
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                Intel i5-8400 or AMD Ryzen5 1500X
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #444",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                Memory
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                8 GB RAM
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #444",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                GPU
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                Nvidia GTX1050Ti 4GB or AMD RX580 4GB
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #444",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                DirectX
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                DirectX 12
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "15px",
                paddingBottom: "15px",
                borderBottom: "1px solid #444",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                Storage
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                20
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0",
                paddingBottom: "0",
                borderBottom: "none",
              }}
            >
              <span
                style={{
                  color: "#aaa",
                  fontSize: "14px",
                  fontWeight: "500",
                  flex: "1",
                }}
              >
                Additional input device
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "14px",
                  textAlign: "right",
                  flex: "1",
                  fontWeight: "500",
                }}
              >
                Gamepad
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
