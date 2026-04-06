/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Chat from "./Chat";
import useSendMessage from "@/hooks/useSendMessage";
import { useOutletContext } from "react-router-dom";
import useGetMessages from "@/hooks/useGetMessages";
import { socket } from "@/util/socket";
import { useRef } from "react";



export default function MessageContainer({ user }: { user: { name: string, avatar: string, address: string } }) {

  const currentUser: { name: string, avatar: string, address: string } = useOutletContext();

  const [messages, setMessages] = useState<any[]>([]);

  const usersMessages = useGetMessages(currentUser?.name, user.name);


  useEffect(() => {
    if (!currentUser) return;
    
    const formattedMessages = usersMessages.map((msg: any) => ({
      message: msg.message,
      mine: msg.from.toLowerCase() === currentUser.address.toLowerCase(), // Determine if the message belongs to the current user
    }));
    setMessages(formattedMessages);

  }, [currentUser?.address, usersMessages]);


  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessage = useSendMessage(currentUser?.address, user.name);

  // Join the correct socket room and listen for typing events
  useEffect(() => {
    if (currentUser?.address) {
      socket.emit("join", currentUser.address);
    }
    const handleTyping = (fromAddress: string) => {
      if (fromAddress === user.address.toLowerCase()) {
        setIsTyping(true);
      }
    };
    const handleStopTyping = (fromAddress: string) => {
      if (fromAddress === user.address.toLowerCase()) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
  }, [currentUser?.address, user.address]);

  const handleTypingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Emit typing status
    if (currentUser?.address) {
      socket.emit("typing", { from: currentUser.address, to: user.address });
      
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { from: currentUser.address, to: user.address });
      }, 2000);
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    socket.emit("stopTyping", { from: currentUser.address, to: user.address });
    await handleMessage(newMessage);
    setNewMessage('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // We convert the file to a massive base64 string. 
    // The Relayer will intercept this and convert it back to an image natively!
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await handleMessage(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="w-full h-full flex flex-col gap-4 flex-1">
      {
        user && (
          <div
            className="flex p-3 items-center gap-4 border-b border-stone-500/80 ">
            <div className="rounded-full w-10 h-10 overflow-hidden bg-secondary">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <h1>{user.name}</h1>
          </div>
        )
      }

      <div className="flex-1 p-7 w-full h-full flex flex-col gap-4">
        <div className="w-full flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {messages.map((message, index) => (
            <Chat key={index} {...message} avatar={user?.avatar} />
          ))}
          {isTyping && (
             <div className="flex gap-3 justify-start w-full transition-opacity duration-300">
               <div className="w-10 h-10 bg-secondary overflow-hidden rounded-full hidden md:flex opacity-60">
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div className="w-max max-w-xl h-max bg-secondary/60 rounded-xl px-4 py-3 flex items-center gap-1">
                 <span className="animate-bounce text-xs">●</span>
                 <span className="animate-bounce text-xs delay-100">●</span>
                 <span className="animate-bounce text-xs delay-200">●</span>
               </div>
             </div>
          )}
        </div>

        <div className="h-12 w-full bg-secondary rounded-full flex items-center px-2">
          {/* File Upload Button Hidden Input */}
          <input type="file" id="upload-image" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="upload-image" className="cursor-pointer ml-3 px-2 py-1 bg-stone-700 hover:bg-stone-600 rounded-full text-lg">
            📎
          </label>
          <Input
            autoComplete="false"
            className="border-0 h-full py-4 rounded-full"
            placeholder="Send a message"
            value={newMessage}
            onChange={handleTypingChange}
            onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
          />
          <Button className="text-sm rounded-full px-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 font-semibold" onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </main>
  );
}
