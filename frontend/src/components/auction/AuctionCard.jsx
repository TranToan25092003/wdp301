import React from "react";
import { Card, Button, Tag } from "antd";
import CountdownTimer from "./CountdownTimer";

const AuctionCard = ({ auction, onViewDetails }) => {
  const now = new Date();
  const startTime = new Date(auction.startTime);
  const isNotStarted = now < startTime;

  return (
    <Card
      hoverable
      style={{
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(22, 101, 52, 0.15)",
        border: "1px solid #e5e7eb",
        padding: 0,
        margin: 0,
        transition: "all 0.2s",
        overflow: "visible",
        background: "#fff",
      }}
      bodyStyle={{ padding: 18 }}
      cover={
        <div className="relative">
          <img
            alt={auction.itemId?.name}
            src={auction.itemId?.images?.[0] || "/assets/fallback.png"}
            style={{
              height: 180,
              objectFit: "cover",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
            }}
          />
          <div className="absolute top-3 right-3">
            <Tag
              color="#16a34a"
              style={{ fontWeight: "bold", fontSize: "12px" }}
            >
              ĐANG ĐẤU GIÁ
            </Tag>
          </div>
        </div>
      }
      onClick={onViewDetails}
    >
      <div style={{ minHeight: 60 }}>
        <h3
          style={{
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 4,
            color: "#166534",
          }}
        >
          {auction.itemId?.name}
        </h3>
        <div style={{ color: "#4b5563", fontSize: 13, marginBottom: 12 }}>
          {auction.itemId?.description?.slice(0, 60) || ""}
        </div>
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Tag color="#16a34a" style={{ fontSize: "14px", padding: "2px 8px" }}>
            Giá hiện tại: {auction.currentPrice.toLocaleString()} ₫
          </Tag>
          <Tag color="#0891b2" style={{ fontSize: "12px" }}>
            {auction.bids?.length || 0} lượt đấu
          </Tag>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 14, color: "#4b5563", fontWeight: 500 }}>
            {isNotStarted ? "Bắt đầu sau: " : "Kết thúc sau: "}
          </span>
          <CountdownTimer
            endTime={auction.endTime}
            startTime={auction.startTime}
          />
        </div>
      </div>
      <Button
        type="primary"
        style={{
          marginTop: 16,
          width: "100%",
          background: "linear-gradient(135deg, #166534 0%, #16a34a 100%)",
          border: "none",
          fontWeight: 600,
          height: "40px",
          borderRadius: "10px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails();
        }}
      >
        Đấu giá ngay
      </Button>
    </Card>
  );
};

export default AuctionCard;
