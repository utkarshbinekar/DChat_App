import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Sidebar({ currentUser, listOfUsers }: { currentUser: { name: string, avatar: string, address: string }, listOfUsers: { name: string, avatar: string, address: string }[] }) {

  const [searchQuery, setSearchQuery] = useState('');
  const { id } = useParams();
  
  const filteredUsers = listOfUsers ? listOfUsers.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="lg:w-[320px] md:w-[280px] w-[250px] p-5 flex border-r border-stone-800/60 bg-stone-950/40 backdrop-blur-3xl flex-col gap-4 shadow-2xl z-20">

      {
        currentUser && (
          <div className="group flex p-3 mt-2 items-center gap-4 bg-gradient-to-tr from-stone-900 to-stone-800/80 rounded-2xl border border-stone-700/50 shadow-lg hover:shadow-cyan-900/20 transition-all duration-300">
            <div className="rounded-full w-12 h-12 overflow-hidden bg-stone-900 border-2 border-stone-700/80 group-hover:border-cyan-500/50 transition-colors duration-300 shadow-inner">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-stone-100 tracking-wide text-md drop-shadow-sm">{currentUser.name}</h1>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-widest uppercase flex items-center gap-1.5 mt-0.5"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" /> Online</span>
            </div>
          </div>
        )
      }

      <div className="flex items-center justify-between pt-4 pb-1">
        <h1 className="text-stone-400 font-semibold text-xs tracking-widest uppercase">Conversations</h1>
      </div>
      
      <div className="relative mb-3 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 group-focus-within:text-cyan-400 transition-colors w-4 h-4" />
        <Input 
          placeholder="Search users..." 
          value={searchQuery} 
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-stone-900/60 border-stone-800 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/30 text-sm h-11 rounded-2xl transition-all shadow-inner text-stone-200 placeholder:text-stone-600" 
        />
      </div>

      <div className="flex flex-col gap-1.5 overflow-y-auto px-1 pb-4 custom-scrollbar -mx-1">
        {filteredUsers.map((user: { name: string, avatar: string, address: string }, index: number) => {
          const isActive = id?.toLowerCase() === user.address.toLowerCase();
          
          return (
            <Link to={`/chat/${user.address}`}
              key={index}
              className={cn(
                "flex cursor-pointer p-3 items-center gap-4 transition-all duration-300 rounded-2xl border group relative overflow-hidden",
                isActive 
                  ? "bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border-stone-700 shadow-md shadow-cyan-900/20" 
                  : "bg-transparent hover:bg-stone-800/40 border-transparent hover:border-stone-800/80"
              )}>
              
              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
              
              <div className={cn(
                "rounded-full w-11 h-11 overflow-hidden transition-all duration-300 shadow-sm relative z-10",
                isActive ? "border-2 border-cyan-400/80" : "border-2 border-stone-800 group-hover:border-stone-600"
              )}>
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <h1 className={cn(
                "font-semibold transition-colors z-10", 
                isActive ? "text-white" : "text-stone-400 group-hover:text-stone-200"
              )}>{user.name}</h1>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
