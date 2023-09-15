import { AnchorProvider, Provider } from '@coral-xyz/anchor';
import { Event, XnftMetadata } from "@coral-xyz/common-public";
import { Connection, PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { XnftWallet } from "../types";

declare global {
  interface Window {
    xnft: any;
  }
}

export function usePublicKeys(): { [key: string]: PublicKey }|undefined {
  const didLaunch = useDidLaunch();
  const [publicKeys, setPublicKeys] = useState();
  useEffect(() => {
    if (didLaunch) {
      window.xnft.on("publicKeysUpdate", () => {
        setPublicKeys(window.xnft.publicKeys);
      });
      setPublicKeys(window.xnft.publicKeys);
    }
  }, [didLaunch, setPublicKeys]);
  return publicKeys;
}

export function useSolanaConnection(): Connection|undefined {
  const didLaunch = useDidLaunch();
  const [connection, setConnection] = useState();
  useEffect(() => {
    if (didLaunch) {
      window.xnft.solana.on("connectionUpdate", () => {
        setConnection(window.xnft.solana.connection);
      });
      setConnection(window.xnft.solana.connection);
    }
  }, [didLaunch, setConnection]);
  return connection;
}

// Returns true if the `window.xnft` object is ready to be used.
export function useDidLaunch() {
  const [didConnect, setDidConnect] = useState(!!window.xnft?.connection);
  useEffect(() => {
    window.addEventListener("load", () => {
      window.xnft.on("connect", () => {
        setDidConnect(true);
      });
      window.xnft.on("disconnect", () => {
        setDidConnect(false);
      });
    });
  }, []);
  return didConnect;
}

export const useReady = useDidLaunch;

export function useMetadata(): XnftMetadata|undefined {
  const didLaunch = useDidLaunch() 
  const [metadata, setMetadata] = useState();

  useEffect(() => {
    if(didLaunch) {
      setMetadata(window.xnft.metadata);
      window.xnft.addListener("metadata", (event: Event) => {
        setMetadata(event.data.metadata);
      });
    }
  }, [didLaunch, setMetadata]);
  return metadata;
}

export function useSolanaProvider(): Provider|undefined {
  const connection = useSolanaConnection();
  const [provider, setProvider] = useState<Provider>();

  useEffect(() => {
    if (connection) {
      setProvider(
        new AnchorProvider(
          connection, 
          new XnftWallet(window.xnft.solana), 
          AnchorProvider.defaultOptions()
        )
      );
    }
  }, [connection, setProvider]);

  return provider;
}

export function useDimensions(debounceMs = 0) {
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });

  const debounce = (fn: Function) => {
    let timer: ReturnType<typeof setTimeout>;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(() => {
        clearTimeout(timer);
        // @ts-ignore
        fn.apply(this, arguments);
      }, debounceMs);
    };
  };

  useEffect(() => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth,
    });

    const debouncedHandleResize = debounce(function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    });

    window.addEventListener("resize", debouncedHandleResize);

    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, []);

  return dimensions;
}
