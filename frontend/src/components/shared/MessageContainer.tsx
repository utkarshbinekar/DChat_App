import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import Chat from "./Chat";
import useSendMessage from "@/hooks/useSendMessage";
import { useOutletContext } from "react-router-dom";
import useGetMessages from "@/hooks/useGetMessages";
import { socket } from "@/util/socket";
import CryptoJS from "crypto-js";
import { Lock, Unlock } from "lucide-react";



export default function MessageContainer({ user }: { user: { name: string, avatar: string, address: string } }) {

  const currentUser: { name: string, avatar: string, address: string } = useOutletContext();

  const [messages, setMessages] = useState<any[]>([]);
  const [reactions, setReactions] = useState<{ [key: string]: any }>({});
  const [hasRead, setHasRead] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [isSecure, setIsSecure] = useState(false);
  
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
      socket.emit("markRead", { from: currentUser.address, to: user.address });
      socket.emit("getReactions", (rx: any) => {
        if(rx) setReactions(rx);
      });
    }

    const handleTyping = (fromAddress: string) => {
      if (fromAddress === user.address.toLowerCase()) setIsTyping(true);
    };
    const handleStopTyping = (fromAddress: string) => {
      if (fromAddress === user.address.toLowerCase()) setIsTyping(false);
    };
    const handleRead = (fromAddress: string) => {
      if (fromAddress === user.address.toLowerCase()) setHasRead(true);
    };
    const handleReaction = (data: { messageIndex: number, reaction: string, from: string }) => {
      setReactions(prev => {
        const next = { ...prev };
        if (!next[data.messageIndex]) next[data.messageIndex] = {};
        next[data.messageIndex][data.from] = data.reaction;
        return next;
      });
    };

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);
    socket.on("messagesRead", handleRead);
    socket.on("reactionAdded", handleReaction);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.off("messagesRead", handleRead);
      socket.off("reactionAdded", handleReaction);
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
    
    let payload = newMessage;
    // Apply E2EE AES encryption locally if room is secured
    if (isSecure && encryptionKey) {
      payload = CryptoJS.AES.encrypt(newMessage, encryptionKey).toString();
    }
    
    await handleMessage(payload);
    setNewMessage('');
  };

  const addReaction = (index: number, reaction: string) => {
    socket.emit("addReaction", { 
      messageIndex: index, 
      reaction, 
      from: currentUser.address, 
      to: user.address 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64String = reader.result as string;
      if (isSecure && encryptionKey) {
        base64String = CryptoJS.AES.encrypt(base64String, encryptionKey).toString();
      }
      await handleMessage(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="w-full h-full flex flex-col gap-4 flex-1 backdrop-blur-3xl bg-[#0d0d12]/80 rounded-3xl relative shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
      {
        user && (
          <div
            className="flex px-6 py-4 items-center justify-between border-b border-stone-800/80 bg-stone-950/40 rounded-t-3xl sticky top-0 z-20 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="rounded-full w-14 h-14 overflow-hidden bg-gradient-to-tr from-cyan-400 to-purple-500 p-[2px] shadow-lg shadow-cyan-900/40 transition-transform duration-300 group-hover:scale-105">
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-900">
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-cyan-400 border-2 border-stone-900 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-stone-100 to-stone-400 drop-shadow-sm">{user.name}</h1>
                <p className="text-[11px] uppercase tracking-widest text-cyan-400/80 font-bold mt-0.5">{hasRead ? "Viewed Chat 👀" : "Connected"}</p>
              </div>
            </div>
            
            {/* E2EE Security Toolbar */}
            <div className="flex items-center gap-2 bg-stone-950/80 p-1.5 rounded-2xl border border-stone-800/80 shadow-inner group transition-all duration-500 hover:shadow-cyan-900/10">
              <Input
                type={isSecure ? "password" : "text"}
                placeholder="E2EE Passphrase..."
                value={encryptionKey}
                onChange={(e) => setEncryptionKey(e.target.value)}
                className="w-40 h-9 border-none bg-transparent text-sm text-stone-300 focus-visible:ring-0 placeholder:text-stone-600 outline-none"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className={`rounded-xl p-2 h-9 w-9 transition-all duration-300 ${isSecure ? 'bg-cyan-500/20 text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]' : 'text-stone-500 hover:text-stone-300 bg-stone-900/80'}`}
                onClick={() => setIsSecure(!isSecure)}
                title={isSecure ? "Session Encrypted" : "Enable Encryption"}
              >
                {isSecure ? <Lock size={16} /> : <Unlock size={16} />}
              </Button>
            </div>
          </div>
        )
      }

      <div className="flex-1 w-full h-full flex flex-col gap-4 overflow-hidden">
        <div className="w-full flex-1 flex flex-col gap-5 overflow-y-auto px-6 pt-14 pb-6 custom-scrollbar">
          {messages.map((message, index) => (
            <Chat 
              key={index} 
              messageIndex={index}
              {...message} 
              avatar={user?.avatar} 
              encryptionKey={isSecure ? encryptionKey : undefined}
              reactions={reactions[index]}
              onReact={addReaction}
              hasRead={hasRead}
            />
          ))}
          {isTyping && (
             <div className="flex gap-3 justify-start w-full transition-opacity duration-300 animate-in fade-in slide-in-from-bottom-3">
               <div className="w-10 h-10 bg-stone-900 overflow-hidden rounded-full hidden md:flex opacity-80 shadow-md border-2 border-stone-800/80 mt-1">
                 <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover grayscale opacity-50" />
               </div>
               <div className="w-max max-w-xl h-max backdrop-blur-md bg-stone-800/60 rounded-3xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm border border-stone-700/50">
                 <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 rounded-full bg-cyan-400/80 animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
             </div>
          )}
        </div>

        <div className="mx-6 mb-6 mt-2 h-16 bg-stone-950/80 backdrop-blur-3xl rounded-3xl flex items-center px-2 py-2 shadow-[0_0_30px_rgba(0,0,0,0.5)] border-t border-stone-700/50 relative z-20 group">
          {/* File Upload Button Hidden Input */}
          <input type="file" id="upload-image" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <label htmlFor="upload-image" className="cursor-pointer ml-2 px-3 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700/50 backdrop-blur-md shadow-inner rounded-xl text-lg transition-transform hover:scale-105 hover:-rotate-6 active:scale-95 duration-200">
            📎
          </label>
          <Input
            autoComplete="false"
            className="border-0 h-full py-4 text-[15px] bg-transparent text-stone-100 placeholder:text-stone-500 focus-visible:ring-0 mx-2 font-medium tracking-wide"
            placeholder={isSecure ? "Type a securely encrypted message..." : "Type your message..."}
            value={newMessage}
            onChange={handleTypingChange}
            onKeyDown={(e) => { if(e.key === 'Enter') handleSendMessage(); }}
          />
          <Button 
            className="text-sm rounded-2xl px-6 h-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-cyan-500/25 active:scale-95 bg-gradient-to-tr from-cyan-600 via-blue-600 to-purple-600 font-bold tracking-widest uppercase border border-white/10" 
            onClick={handleSendMessage}
          >
            {isSecure ? 'Encrypt' : 'Send'}
          </Button>
        </div>
      </div>
    </main>
  );
}
