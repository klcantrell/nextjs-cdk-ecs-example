import { useEffect, useRef } from "react";

export function useEffectOnce(callback: () => void) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      hasRun.current = true;

      callback();
    }
    // the purpose of this hook is to run the side-effect only once
    // we don't need the effect to rerun for any reason including hypothetical dependency changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
