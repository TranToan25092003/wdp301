import React from "react";
import { Card, Button, Tag } from "antd";
import CountdownTimer from "./CountdownTimer";

const AuctionCard = ({ auction, bidCount, onViewDetails }) => {
  return (
    <Card
      hoverable
      style={{
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(34,197,94,0.10)",
        border: "1px solid #e5e7eb",
        padding: 0,
        margin: 0,
        transition: "all 0.2s",
        overflow: "visible",
        background: "#fff",
      }}
      bodyStyle={{ padding: 18 }}
      cover={
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
      }
      onClick={onViewDetails}
    >
      <div style={{ minHeight: 60 }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
          {auction.itemId?.name}
        </h3>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>
          {auction.itemId?.description?.slice(0, 60) || ""}
        </div>
        <div style={{ marginBottom: 8 }}>
          <Tag color="green">Hiện tại: {auction.currentPrice} đ</Tag>
          {/* <Tag color="blue">
            {typeof bidCount === "number"
              ? bidCount
              : auction.bids?.length || 0}{" "}
            lượt bid
          </Tag> */}
        </div>
        <div>
          <span style={{ fontSize: 14, color: "#64748b" }}>Kết thúc sau: </span>
          <CountdownTimer endTime={auction.endTime} />
        </div>
      </div>
      <Button
        type="primary"
        style={{
          marginTop: 16,
          width: "100%",
          background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
          border: "none",
          fontWeight: 600,
        }}
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails();
        }}
      >
        Xem chi tiết
      </Button>
    </Card>
  );
};

export default AuctionCard;
