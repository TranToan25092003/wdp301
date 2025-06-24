import React, { useState, useEffect } from "react";
import { Layout, Typography, Divider, Button, Spin } from "antd";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getAllAuctions } from "@/API/huynt.api/auction.api";
import AuctionCard from "@/components/auction/AuctionCard";
import CreateAuctionForm from "@/components/auction/CreateAuctionForm";
import socket, { initializeSocket } from "@/utils/socket";

const { Content } = Layout;
const { Title } = Typography;

export const auctionListLoader = async () => {
  try {
    const dataAuctions = await getAllAuctions();
    return { dataAuctions };
  } catch (error) {
    console.error("Error fetching auctions:", error);
    return { dataAuctions: { data: [] } };
  }
};

const AuctionPage = () => {
  const { dataAuctions } = useLoaderData();
  const [auctions, setAuctions] = useState(dataAuctions.auctions || []);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const socketInstance = initializeSocket();

    socketInstance.on("bidUpdate", (updatedAuction) => {
      setAuctions((prev) =>
        prev.map((auction) =>
          auction._id === updatedAuction._id ? updatedAuction : auction
        )
      );
    });

    return () => {
      socketInstance.off("bidUpdate");
    };
  }, []);

  const handleDelete = (auctionId) => {
    setAuctions((prev) => prev.filter((auction) => auction._id !== auctionId));
  };

  const handleCreate = (newAuction) => {
    setAuctions((prev) => [...prev, newAuction]);
    setIsModalOpen(false);
  };

  return (
    <Layout style={{ backgroundColor: "#fff", padding: "20px" }}>
      <Content>
        {loading ? (
          <Spin
            size="large"
            style={{ display: "block", margin: "50px auto" }}
          />
        ) : auctions.length === 0 ? (
          <Title level={4}>No auctions available</Title>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {auctions.map((auction) => (
              <AuctionCard
                key={auction._id}
                auction={auction}
                onDelete={handleDelete}
                onViewDetails={() => navigate(`/auctions/${auction._id}`)}
              />
            ))}
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default AuctionPage;
