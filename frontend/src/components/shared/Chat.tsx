import { cn } from "@/lib/utils";
import CryptoJS from "crypto-js";
import { Lock, Unlock, CheckCheck, Check } from "lucide-react";
import { useState } from "react";

export default function Chat({
  mine,
  message,
  avatar,
  messageIndex,
  encryptionKey,
  reactions,
  onReact,
  hasRead
}: {
  mine: boolean;
  message: string;
  avatar: string;
  messageIndex?: number;
  encryptionKey?: string;
  reactions?: { [key: string]: string };
  onReact?: (index: number, reaction: string) => void;
  hasRead?: boolean;
}) {
  const [showReactions, setShowReactions] = useState(false);
  const defaultEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  // Decryption logic
  let displayMessage = message;
  let isEncrypted = false;
  let successfullyDecrypted = false;

  if (message && message.startsWith("U2FsdGVkX1")) {
    isEncrypted = true;
    if (encryptionKey) {
      try {
        const bytes = CryptoJS.AES.decrypt(message, encryptionKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          displayMessage = decrypted;
          successfullyDecrypted = true;
        }
      } catch (e) {
        // Decryption failed (wrong key)
      }
    }
  }

  // Is displayMessage a file url or base64 data string (for decrypted files)?
  const isAttachment = displayMessage && (
    (displayMessage.startsWith("http://localhost:") && displayMessage.includes("/uploads/")) ||
    displayMessage.startsWith("data:image/")
  );

  // Render unique reactions
  const reactionCounts: { [rx: string]: number } = {};
  if (reactions) {
     Object.values(reactions).forEach(rx => {
       reactionCounts[rx] = (reactionCounts[rx] || 0) + 1;
     });
  }

  return (
    <div
      className={cn("flex gap-3 w-full relative group animate-in slide-in-from-bottom-3 fade-in duration-500", {
        "justify-end": mine,
        "justify-start": !mine,
      })}>
      {!mine && (
        <div className="w-10 h-10 overflow-hidden rounded-full hidden md:flex shadow-md border-2 border-stone-800/80 bg-stone-900 mt-1 flex-shrink-0">
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      )}
      
      <div className="flex flex-col gap-1 relative max-w-[85%] md:max-w-[70%]">
        
        <div
          className={cn("w-max max-w-full h-max rounded-3xl px-2 py-2 shadow-lg relative transition-all duration-300", {
            "bg-gradient-to-tr from-cyan-600 via-blue-500 to-purple-600 text-white rounded-br-sm shadow-cyan-900/20": mine,
            "backdrop-blur-xl bg-stone-800/80 text-stone-100 rounded-tl-sm border border-stone-700/50 shadow-black/40": !mine,
          })}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
           {/* Inner Highlight for Depth */}
           <div className="absolute inset-0 rounded-3xl pointer-events-none border border-white/10 mix-blend-overlay" />

           {/* Main Message Content */}
           <div className="flex flex-col relative px-3 py-1.5 z-10">
             {isEncrypted && (
               <div className="flex items-center gap-1.5 mb-2 opacity-80 text-[11px] font-bold tracking-widest uppercase">
                 {successfullyDecrypted ? <Unlock size={12} className="text-cyan-200" /> : <Lock size={12} className="text-pink-400" />}
                 <span className={successfullyDecrypted ? "text-cyan-100" : "text-pink-300"}>
                   {successfullyDecrypted ? 'Decrypted Session' : 'Locked Payload'}
                 </span>
               </div>
             )}

             {isEncrypted && !successfullyDecrypted ? (
                <p className="text-sm blur-[3px] select-none opacity-40 break-all line-clamp-2">
                  {message.slice(0, 50)}...
                </p>
             ) : isAttachment ? (
               <div className="rounded-2xl overflow-hidden shadow-inner border border-white/10 mt-1 bg-black/20">
                 <img src={displayMessage} alt="attachment" className="w-64 max-h-72 object-cover hover:scale-105 transition-transform duration-500" />
               </div>
             ) : (
               <p className="text-[15px] break-words leading-relaxed whitespace-pre-wrap font-medium tracking-wide drop-shadow-sm">{displayMessage}</p>
             )}
             
             {/* Read Receipts space */}
             {mine && (
                <div className="self-end mt-2 flex items-center justify-end -mb-1 -mr-1">
                   {hasRead ? <CheckCheck size={16} className="text-cyan-200 drop-shadow-[0_0_5px_rgba(165,243,252,0.8)]" /> : <Check size={14} className="text-white/50" />}
                </div>
             )}
           </div>

           {/* Reaction Emojis Popover */}
           {showReactions && onReact && typeof messageIndex === 'number' && (
              <div className={cn("absolute top-[-44px] flex items-center gap-1.5 p-2 rounded-full bg-stone-900 border border-stone-700 shadow-2xl shadow-black/60 animate-in zoom-in-75 duration-200 z-30", {
                "right-0 origin-bottom-right": mine,
                "left-0 origin-bottom-left": !mine
              })}>
                 {defaultEmojis.map((emoji, i) => (
                   <button 
                     key={emoji}
                     onClick={() => { onReact(messageIndex, emoji); setShowReactions(false) }}
                     className="hover:scale-150 transition-all duration-200 hover:-translate-y-1 hover:bg-stone-800 p-1 rounded-full text-xl leading-none"
                     style={{ animationDelay: `${i * 50}ms` }}
                   >
                     {emoji}
                   </button>
                 ))}
                 <div className="absolute -bottom-2 w-3 h-3 bg-stone-900 border-r border-b border-stone-700 rotate-45" style={{ [mine ? 'right' : 'left']: '16px' }} />
              </div>
           )}

           {/* Reaction Badges */}
           {Object.keys(reactionCounts).length > 0 && (
             <div className={cn("absolute -bottom-3.5 flex flex-wrap gap-1 z-20", {
               "right-3": mine,
               "left-3": !mine
             })}>
               {Object.entries(reactionCounts).map(([rx, count]) => (
                  <span key={rx} className="bg-stone-900/90 border border-stone-600/80 text-sm px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md animate-in zoom-in group-hover:scale-110 transition-transform cursor-default">
                    {rx} {count > 1 && <span className="text-[11px] text-stone-300 font-bold">{count}</span>}
                  </span>
               ))}
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
