const ethers = require("ethers");
require("dotenv").config();
const CHAT_ABI = require("./chatAbi.json");
const ENS_ABI = require("./ensAbi.json");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("common"));

// Create uploads dir and serve statically
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
app.use("/uploads", express.static("uploads"));

function getWallet() {
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return wallet;
}

async function sendMessage(data) {
  try {
    const wallet = getWallet();

    const contract = new ethers.Contract(
      process.env.CHAT_CONTRACT_ADDRESS,
      CHAT_ABI,
      wallet
    );

    const tx = await contract.sendMessage(data.from, data.msg, data.to);
    const receipt = await tx.wait();
    if (receipt.status) {
      return { success: true, tx, message: "Message sent" };
    } else {
      return { success: false, tx, message: "Message send failed" };
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      tx: {},
      message: error?.reason ?? "ERROR_OCCURED",
    };
  }
}

async function createAccount(data) {
  try {
    const wallet = getWallet();

    const contract = new ethers.Contract(
      process.env.ENS_CONTRACT_ADDRESS,
      ENS_ABI,
      wallet
    );

    const tx = await contract.createAccount(data.from, data.avatar, data.name);
    const receipt = await tx.wait();
    if (receipt.status) {
      return { success: true, tx, message: "Registration successful" };
    } else {
      return { success: false, tx, message: "Registration failed" };
    }
  } catch (error) {
    console.error("CREATE_ACCOUNT_ERROR:", error);
    return {
      success: false,
      tx: {},
      message: error?.reason || error?.message || "ERROR_OCCURED",
    };
  }
}

function verifyMessageWithEthers(message, signature) {
  const signerAddress = ethers.verifyMessage(message, signature);
  return signerAddress;
}

app.post("/forward-message", async (req, res) => {
  const data = req.body;
  const signerAddress = verifyMessageWithEthers(
    JSON.stringify({
      from: data.from,
      msg: data.msg,
      to: data.to,
    }),
    data.signature
  );
  if (signerAddress.toLowerCase() === data.from.toLowerCase()) {
    const tx = await sendMessage(data);
    if (tx.success) {
      res.status(200).send(tx);
    } else {
      res.status(500).send(tx);
    }
  } else {
    res.status(400).send({ success: false, message: "Invalid signature" });
  }
});

app.post("/register-user", async (req, res) => {
  const data = req.body;
  const signerAddress = verifyMessageWithEthers(
    JSON.stringify({
      from: data.from,
      avatar: data.avatar,
      name: data.name,
    }),
    data.signature
  );
  if (signerAddress.toLowerCase() === data.from.toLowerCase()) {
    
    // IF the avatar is a massive base64 string, save it locally to avoid EVM Out-Of-Gas errors
    if (data.avatar && data.avatar.startsWith("data:image/")) {
      try {
        const base64Data = data.avatar.replace(/^data:image\/\w+;base64,/, "");
        const filePath = `uploads/${data.from.toLowerCase()}.png`;
        fs.writeFileSync(filePath, base64Data, 'base64');
        data.avatar = `http://localhost:${process.env.PORT || 5000}/${filePath}`;
      } catch (err) {
        console.error("Failed to save avatar image", err);
      }
    }

    const tx = await createAccount(data);
    if (tx.success) {
      res.status(200).send(tx);
    } else {
      res.status(500).send(tx);
    }
  } else {
    res.status(400).send({ success: false, message: "Invalid signature" });
  }
});

const server = app;
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log("server running on port ", PORT);
});
