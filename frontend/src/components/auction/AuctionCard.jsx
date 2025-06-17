import React from "react";
import { Card, Button, Typography } from "antd";
import { deleteAuctionById } from "@/API/huynt.api/auction.api";

const { Title, Text } = Typography;

const AuctionCard = ({ auction, onDelete, onViewDetails }) => {
  const handleDelete = async () => {
    try {
      await deleteAuctionById(auction._id);
      onDelete(auction._id);
    } catch (error) {
      console.error("Error deleting auction:", error);
    }
  };

  // Get the first image from item's images array, or use a default image
  const itemImage = auction.itemId?.images?.[0] || "/assets/sample.jpg";

  return (
    <Card
      hoverable
      style={{ width: "100%" }}
      cover={
        <img
          alt={auction.itemId?.name || "Auction item"}
          src={itemImage}
          style={{ height: 200, objectFit: "cover" }}
        />
      }
    >
      <Title level={4}>{auction.itemId?.name}</Title>
      <Text>{auction.itemId?.description}</Text>
      <br />
      <Text strong>Current Price: </Text>${auction.currentPrice}
      <br />
      <Text strong>End Time: </Text>
      {new Date(auction.endTime).toLocaleString()}
      <div style={{ marginTop: "10px" }}>
        <Button
          type="primary"
          onClick={onViewDetails}
          style={{ marginRight: "10px" }}
        >
          View Details
        </Button>
        <Button type="danger" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default AuctionCard;
