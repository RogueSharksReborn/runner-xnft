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

const COLLECTION_MINT = new PublicKey('FREP9swLijQRyFXyrJTP8AB4ucx1iFP5jr4b3N1zRx52')
const MINT = new PublicKey('HXPnDtKgaERmNPDpMEra2PHRJAJry5d6fQoBHkhB9MDb')

function App() {
  const { triggerGameOver } = useConsoleInterceptor();
  const publicKeys = usePublicKeys();
  const dimensions = useDimensions();

  const [loading, setLoading] = useState(true);
  const [belowThreshold, setBelowThreshold] = useState(false);

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
  

  const handleSkip = async () => {
    await upgrade();
  };

  const getMetadataAddress = () => {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata', 'utf8'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        MINT.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )[0];
  };

  const upgrade = async () => {
    try {
      const provider = new AnchorProvider(window.xnft?.solana.connection, window.xnft?.solana, AnchorProvider.defaultOptions())
      await AtomicArtUpgradesClient.upgradeMetadata(COLLECTION_MINT, MINT, getMetadataAddress(), provider)
    } catch (err) {
      console.log('upgrade error', err);
    }
  }

  const handleResize = () => {
    window.xnft.popout( { fullscreen: true } );
  };

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
