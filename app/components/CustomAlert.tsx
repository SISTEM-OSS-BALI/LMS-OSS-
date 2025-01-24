/* eslint-disable @typescript-eslint/no-explicit-any */
import { Alert, Flex } from "antd";

export default function CustomAlert({ type, message }: any) {
  return (
    <Flex
      style={{ width: "100%", marginTop: 200 }}
      justify="center"
      align="center"
    >
      <Alert type={type} message={message} />
    </Flex>
  );
}
