
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "../ui/input";

export default function Sidebar({ currentUser, listOfUsers }: { currentUser: { name: string, avatar: string, address: string }, listOfUsers: { name: string, avatar: string, address: string }[] }) {

  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredUsers = listOfUsers ? listOfUsers.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="lg:w-[350px] md:w-[300px] w-[250px] p-6 flex border-r border-stone-100/40 flex-col gap-2">

      <h1 className="py-3 text-stone-100">Current User</h1>
      {
        currentUser && (
          <div className="flex p-3 items-center gap-4 bg-stone-900  rounded-lg border border-stone-500/80 hover:border-purple-400/60">
            <div className="rounded-full w-10 h-10 overflow-hidden bg-secondary">
              <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
            </div>
            <h1>{currentUser.name}</h1>
          </div>
        )
      }

      <div className="flex items-center justify-between py-3">
        <h1 className="text-stone-100">List of Users</h1>
      </div>
      
      <Input 
        placeholder="Search users..." 
        value={searchQuery} 
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-3 bg-stone-900 border-stone-700" 
      />

      <div className="flex flex-col gap-2 overflow-y-auto">
        {filteredUsers.map((user: { name: string, avatar: string, address: string }, index: number) => (
          <Link to={`/chat/${user.address}`}
            key={index}
            className="flex cursor-pointer p-3 items-center gap-4 bg-stone-900  rounded-lg border border-stone-500/80 hover:border-purple-400/60">
            <div className="rounded-full w-10 h-10 overflow-hidden bg-secondary">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <h1>{user.name}</h1>
          </Link>
        ))}
      </div>
    </div>
  );
}
