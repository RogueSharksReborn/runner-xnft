import { useEffect, useState } from 'react';

export const useConsoleInterceptor = () => {
  const [triggerGameOver, setTriggerGameOver] = useState(false)

  useEffect(() => {
    const originalConsoleLog = console.log;

    function overrideLog(...args: any) {
      originalConsoleLog(...args);
      handleConsoleLog(args);
    }

    console.log = overrideLog;

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  function getBoolean(str: any) {
    const match = str[0].match(/Send to js: (true|false)/);
  
    if (match) {
      return match[1] === 'true'; 
    }
  
    return false;
  }

  const handleConsoleLog = (args: any) => {
    const log = args[0];
    try {
        if (log.includes('Send to js')) {
            setTriggerGameOver(getBoolean(args))
        }
    } catch (error) {
        console.log(error)
    }
  };

  return { triggerGameOver }
};
