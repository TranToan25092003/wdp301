import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

import { useLocation, useNavigate } from "react-router-dom";

export function ItemCard({ item, status, children, rejectReason }) {
  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
        <img
          src={item.images[0]}
          alt={item.name}
          className="w-32 h-32 object-fill rounded-md mr-20"
        />
        <div className="flex-1">
          <p className="text-gray-600">{item.description}</p>
          <p className="text-gray-800 font-medium">
            Giá: {item.price.toLocaleString()} VND/{item.rate}
          </p>
          <p className="text-sm">
            Trạng thái:{" "}
            <span
              className={`

              ${
                status === "pending"
                  ? "text-green-600"
                  : status == "available"
                  ? "text-green-600"
                  : "text-yellow-600"
              } 
              `}
            >
              {status === "pending"
                ? "đang chờ"
                : status == "available"
                ? "available"
                : "not available"}
            </span>
          </p>
          <p className="text-sm">Miễn phí: {item.isFree ? "Có" : "Không"}</p>

          {rejectReason && (
            <p className="text-sm">
              reject reason: <b className="text-red-500">{rejectReason}</b>
            </p>
          )}
        </div>

        <div className="flex flex-col ">{children}</div>
      </CardContent>
    </Card>
  );
}
