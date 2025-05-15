import React from "react";

import { Pagination } from "antd";

const PaginationComponent = (props) => {
  const { align, total, onChange, pageSize, currentPage } = props;
  return (
    <Pagination
      defaultCurrent={currentPage}
      total={total}
      align={align}
      onChange={onChange}
      pageSize={pageSize}
      showSizeChanger={false}
    />
  );
};

export default PaginationComponent;
