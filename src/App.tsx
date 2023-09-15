/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import { useDimensions, usePublicKeys } from './hooks';
import ReactLoading from 'react-loading';
import { useConsoleInterceptor } from './hooks/consoleOverride';
import { AtomicArtUpgradesClient } from 'rogue-sharks-sdk';
import { PublicKey } from '@solana/web3.js';
import './App.css';
import { TOKEN_METADATA_PROGRAM_ID } from '@coral-xyz/xnft';
import { AnchorProvider } from '@coral-xyz/anchor';
import { useLocation } from 'react-router-dom';


const COLLECTION_MINT = new PublicKey('FREP9swLijQRyFXyrJTP8AB4ucx1iFP5jr4b3N1zRx52')

function App() {
  const { triggerGameOver } = useConsoleInterceptor();
  const publicKeys = usePublicKeys();
  const dimensions = useDimensions();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [belowThreshold, setBelowThreshold] = useState(false);
  const [mint, setMint] = useState<string | null>(null);

  const { unityProvider, loadingProgression, isLoaded } = useUnityContext({ 
    loaderUrl: 'build/SharkRun.loader.js',
    dataUrl: 'build/SharkRun.data.unityweb',
    frameworkUrl: 'build/SharkRun.framework.js.unityweb',
    codeUrl: 'build/SharkRun.wasm.unityweb', 
  });

  useEffect(() => {
    if (dimensions.width <= 375 && dimensions.height <= 600) {
      setBelowThreshold(true)
    } else {
      setBelowThreshold(false)
    }
  }, [dimensions]);

  useEffect(() => {
    if (publicKeys) {
      setLoading(false); 
    }
  }, [publicKeys]);

  
  useEffect(() => {
    if (triggerGameOver) {
      (async () => {
        await upgrade();
      })();
      
    }
  }, [triggerGameOver]);

  useEffect(() => {
    console.log('extracting mint...')
    extractMint();
  }, [location]);
  

  const handleSkip = async () => {
    await upgrade();
  };

  const getMetadataAddress = () => {
    if (!mint) return;
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata', 'utf8'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        new PublicKey(mint).toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  };

  const upgrade = async () => {
    if (!mint) return;
    try {
      const provider = new AnchorProvider(window.xnft?.solana.connection, window.xnft?.solana, AnchorProvider.defaultOptions())
      await AtomicArtUpgradesClient.upgradeMetadata(COLLECTION_MINT, new PublicKey(mint), getMetadataAddress()!, provider)
    } catch (err) {
      console.log('upgrade error', err);
    }
  }

  const handleResize = () => {
    window.xnft.popout( { fullscreen: true } );
  };

  const extractMint = () => {
    const url = location.pathname;
    const parts = url.split('/');
    const mint = parts[parts.length - 1];
    console.log('collectible mint', mint);
    setMint(mint);
  }

  const renderContent = () => {
    if (belowThreshold) {
      return (
        <div className='full-screen flex-center'>
          <button className='upgrade-button' onClick={handleResize}>
            Resize Component
          </button>
        </div>
      );
    } else {
      return (
        <div className="App full-screen flex-center flex-col">
          {loading ? (
            <div className='flex-center full-screen'>
              <ReactLoading type='spin' color='red' />
            </div>
          ) : (
            <>
              <Unity unityProvider={unityProvider} style={{ width: 800, height: 600 }}/>
              <p style={{ visibility: isLoaded ? "hidden" : "visible", color: "white" }}>Loading Application... {Math.round(loadingProgression * 100)}%</p>
              <button className="upgrade-button" onClick={() => handleSkip()}>Skip Game & Upgrade</button>
            </>
          )}
        </div>
      );
    }
  };

  return renderContent();
}

export default App;
