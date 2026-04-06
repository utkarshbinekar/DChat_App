/* eslint-disable @typescript-eslint/no-explicit-any */
import { useWallet } from "@/context/WalletContext";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { isSupportedChain } from "@/util";
import { useNavigate } from "react-router-dom";

const useCreateUser = (address: any, url: string, username: string) => {
  const { chainId, switchNetwork, getSigner } = useWallet();

  const navigate = useNavigate();

  return useCallback(async () => {
    console.log("[useCreateUser] chainId from wallet:", chainId, "expected:", 1337);
    console.log("[useCreateUser] isSupportedChain:", isSupportedChain(chainId));
    if (!isSupportedChain(chainId)) {
      toast.warn("Switching network...", { position: "top-right" });
      await switchNetwork();
      // Important: after triggering a network switch, we return so the user can complete the switch.
      // They will need to click Register again, which is standard for dApps.
      return;
    }

    const signer = await getSigner();

    const toastId = toast.loading("Registering...", {
      position: "top-right",
    });

    const registrationTx = {
      from: address,
      avatar: url,
      name: username,
    };

    try {
      const signature = await signer.signMessage(
        JSON.stringify(registrationTx)
      );

      const response = await fetch(
        `${import.meta.env.VITE_RELAYER_URL || "http://localhost:5000"}/register-user`,
        {
          method: "POST",
          body: JSON.stringify({ ...registrationTx, signature }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const jsonResponse = await response.json();

      if (jsonResponse.success) {
        toast.dismiss(toastId);
        navigate("/chat");
        return toast.success(jsonResponse.message, {
          position: "top-right",
        });
      } else {
        toast.dismiss(toastId);
        navigate("/signup");
        return toast.error(jsonResponse.message, {
          position: "top-right",
        });
      }
    } catch (error: any) {
      toast.dismiss(toastId);
      navigate("/signup");
      toast.error("OOPS!! SOMETHING_WENT_WRONG", {
        position: "top-right",
      });
    }
  }, [username, url, address, chainId, getSigner, navigate]);
};

export default useCreateUser;
