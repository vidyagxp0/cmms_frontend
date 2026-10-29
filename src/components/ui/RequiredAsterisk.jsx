
import React from "react";
import { Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";

const RequiredAsterisk = ({ message = "This field is required. Please fill in this field." }) => {
  return (
    <Tooltip
      title={
        <span className="flex items-center gap-2 text-xs">
          <InfoCircleOutlined />
          <span>{message}</span>
        </span>
      }
      placement="top"
      color="#991B1B"
      mouseEnterDelay={0.15}
    >
      <span
        tabIndex={0}
        role="img"
        aria-label={message}
        className="
          ml-1 inline-flex cursor-help items-center
          text-[10px] font-extrabold leading-none text-red-600
          transition-all duration-200 ease-out
          hover:scale-125 hover:text-red-700
          hover:drop-shadow-[0_0_4px_rgba(220,38,38,0.35)]
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-red-400 focus-visible:ring-offset-2
          rounded-sm
        "
      >
        *
      </span>
    </Tooltip>
  );
};

export default RequiredAsterisk;
