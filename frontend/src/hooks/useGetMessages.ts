import { getChatContract } from "@/constants/contract";
import { readOnlyProvider } from "@/constants/provider";
import { useCallback, useEffect, useState } from "react";
import { socket } from "@/util/socket";

const useGetMessages = (from: string, to: string) => {
  const [messages, setMessages] = useState([]);

  const fetchMessages = useCallback(async () => {
    if (!from || !to) return;
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

    // Listen for real-time live messages from our socket server instead of polling
    const handleNewMessage = (data: { from: string, message: string }) => {
      // Refresh messages if this new message comes from the person we're chatting with, or from ourselves (syncing across devices)
      if (data.from === to.toLowerCase() || data.from === from.toLowerCase()) {
        fetchMessages();
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [fetchMessages, from, to]);

  return messages;
};

export default useGetMessages;
