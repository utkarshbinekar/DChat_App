/* eslint-disable @typescript-eslint/no-explicit-any */
import { isSupportedChain } from "@/util";
import { useWallet } from "@/context/WalletContext";
import { useCallback } from "react";
import { toast } from "react-toastify";

const useSendMessage = (from: string, to: string) => {
  const { chainId, switchNetwork, getSigner } = useWallet();

  return useCallback(async (msg: string) => {
    if (!isSupportedChain(chainId)) {
      toast.warn("Switching network...", { position: "top-right" });
      await switchNetwork();
      return;
    }

    const signer = await getSigner();

    const toastId = toast.loading("Sending...", {
      position: "top-right",
    });

    const messageTx = {
      from: from,
      msg: msg,
      to: to,
    };

    try {
      const signature = await signer.signMessage(JSON.stringify(messageTx));

      const response = await fetch(
        `${import.meta.env.VITE_RELAYER_URL || "http://localhost:5000"}/forward-message`,
        {
          method: "POST",
          body: JSON.stringify({ ...messageTx, signature }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        toast.dismiss(toastId);
        return toast.success(jsonResponse.message, {
          position: "top-right",
        });
      } else {
        toast.dismiss(toastId);
        return toast.error(jsonResponse.message, {
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.dismiss(toastId);

      toast.error("OOPS!! SOMETHING_WENT_WRONG", {
        position: "top-right",
      });
    }
  }, [chainId, getSigner, from, to]);
};

export default useSendMessage;
