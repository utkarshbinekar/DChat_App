/* eslint-disable @typescript-eslint/no-explicit-any */
import Sidebar from "@/components/shared/Sidebar";
import { useGetAllUsers } from "@/hooks/useGetAllUsers";
import { useWallet } from "@/context/WalletContext";
import { Outlet } from "react-router-dom";


const ChatLayout = () => {
    const { isConnected, address } = useWallet();

    const data = useGetAllUsers();

    const currentUser = data.filter((user: { address: string }) => user.address.toLowerCase() === address?.toLowerCase())[0];

    const listOfUsers = data.filter((user: { address: string }) => user.address.toLowerCase() !== address?.toLowerCase());

    return (
        <div className="w-full h-screen overflow-hidden flex bg-[#0a0a0d] text-white relative items-center justify-center p-4 md:p-8">
            {/* Organic animated ambient background glows */}
            <div className="absolute top-0 -left-10 w-96 h-96 bg-cyan-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob pointer-events-none" />
            <div className="absolute top-20 -right-10 w-96 h-96 bg-purple-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000 pointer-events-none" />
            <div className="absolute -bottom-20 left-40 w-96 h-96 bg-pink-600/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000 pointer-events-none" />

            {
                isConnected && (
                    <div className="w-full h-full max-w-7xl max-h-[900px] flex rounded-3xl overflow-hidden border-2 border-stone-800/60 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-3xl bg-stone-950/40 z-10 relative">
                        <Sidebar currentUser={currentUser} listOfUsers={listOfUsers} />
                        <Outlet context={currentUser} />
                    </div>
                )
            }
            {
                !isConnected && (
                    <div className="w-full h-full max-w-[1440px] flex flex-col justify-center items-center overflow-y-auto bg-stone-950 mx-auto rounded-md ">
                        <h1 className="text-stone-100 text-4xl">Please connect your wallet</h1>
                    </div>
                )
            }


        </div>
    )
}

export default ChatLayout