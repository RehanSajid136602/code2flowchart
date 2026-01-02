'use client';

import { useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useLogicStore } from '@/store/useLogicStore';

export function useSyncLogic() {
  const { code, setNodes, setEdges, setIsSyncing, setLastModelUsed } = useLogicStore();
  const [debouncedCode] = useDebounce(code, 800);

  useEffect(() => {
    let lastSyncedCode = '';
    
    async function sync() {
      if (!debouncedCode || debouncedCode.length < 10 || debouncedCode === lastSyncedCode) return;

      setIsSyncing(true);
      try {
        const response = await fetch('/api/diagram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: debouncedCode }),
        });

        if (response.ok) {
          const data = await response.json();
          setNodes(data.nodes);
          setEdges(data.edges);
          setLastModelUsed(data.modelUsed);
          lastSyncedCode = debouncedCode;
        }
      } catch (error) {
        console.error('Sync failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }

    sync();
  }, [debouncedCode, setNodes, setEdges, setIsSyncing, setLastModelUsed]);
}
