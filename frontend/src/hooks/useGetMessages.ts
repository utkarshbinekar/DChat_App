import { getChatContract } from "@/constants/contract";
import { readOnlyProvider } from "@/constants/provider";
import { useCallback, useEffect, useRef, useState } from "react";

const useGetMessages = (from: string, to: string) => {
  const [messages, setMessages] = useState([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const contract = getChatContract(readOnlyProvider);
      const res = await contract.getMessagesBetweenUsers(from, to);
      const converted = res.map((item: [string, string, string]) => ({
        from: item[0],
        to: item[1],
        message: item[2],
      }));
      setMessages(converted);
    } catch (err) {
      console.error(err);
    }
  }, [from, to]);

  useEffect(() => {
    fetchMessages();

    // Poll every 3 seconds instead of using WebSocket (Hardhat doesn't support WSS)
    intervalRef.current = setInterval(fetchMessages, 3000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchMessages]);

  return messages;
};

export default useGetMessages;
