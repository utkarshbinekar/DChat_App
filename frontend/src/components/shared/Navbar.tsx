import { useWallet } from "@/context/WalletContext";
import { Link } from "react-router-dom"


const Navbar = () => {
    const { isConnected, address, connect, disconnect } = useWallet();
    return (
        <header className="w-full flex justify-between items-center py-6 border-b border-stone-100/30 px-4">
            <Link to="/" className="font-light text-xl text-stone-100">
                Chat<span className="font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Zone</span>
            </Link>
            {
                !isConnected && (
                    <div className="flex items-center justify-center gap-4">
                        <Link className="font-light text-stone-100" to="/">Home</Link>
                        <Link className="font-light text-stone-100" to="/signup">Signup</Link>
                        <Link className="font-light text-stone-100" to="/chat">Chat</Link>
                    </div>
                )
            }
            {isConnected ? (
                <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 font-mono">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <button
                        onClick={disconnect}
                        className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-white hover:opacity-90 transition-opacity"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <button
                    onClick={connect}
                    className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-white hover:opacity-90 transition-opacity"
                >
                    Connect Wallet
                </button>
            )}
        </header>
    )
}

export default Navbar