import React from "react";

const FailedModal = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={styles.modalTitle}>Thanh toán thất bại!</h2>
        <p>Giao dịch của bạn không thành công. Vui lòng thử lại hoặc liên hệ với nhân viên hỗ trợ.</p>
        <button style={styles.closeBtn} onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
    animation: "fadeIn 0.3s ease-in-out",
  },
  modalTitle: {
    color: "#e74c3c",
    fontSize: "20px",
    marginBottom: "10px",
  },
  closeBtn: {
    background: "#e74c3c",
    color: "white",
    border: "none",
    padding: "10px 20px",
    marginTop: "15px",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background 0.3s",
  },
};

export default FailedModal;