import React from "react";
import { Layout, Typography } from "antd";
import { useLoaderData, useNavigate } from "react-router-dom";
import AuctionCard from "@/components/auction/AuctionCard";
import { getAllAuctions } from "@/API/huynt.api/auction.api";
import { filterNonDisplayableAuctions } from "@/lib/utils";

const { Content } = Layout;
const { Title } = Typography;

export const auctionListLoader = async () => {
  try {
    const response = await getAllAuctions();
    console.log("Raw auctions data:", response); // Debug log
    return response;
  } catch (error) {
    console.error("Error loading auctions:", error);
    return { auctions: [] };
  }
};

const AuctionPage = () => {
  const { auctions: rawAuctions } = useLoaderData();
  const navigate = useNavigate();

  // Lọc các phiên đấu giá không hợp lệ
  const auctions = filterNonDisplayableAuctions(rawAuctions);
  console.log("Filtered auctions:", auctions); // Debug log

  return (
    <Layout style={{ backgroundColor: "#fff", padding: "20px" }}>
      <Content>
        {!auctions || auctions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Title level={4} style={{ color: "#666" }}>
              Không có phiên đấu giá nào đang diễn ra
            </Title>
          </div>
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
                bidCount={auction.bids ? auction.bids.length : 0}
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
