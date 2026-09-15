import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // 정적 렌더링(SSR) 이후 클라이언트에서 실제 색상 스킴으로 다시 계산하기 위한 표준
    // hydration-flag 패턴이다 — 외부 상태 동기화가 아니므로 이 규칙의 오탐으로 보고 예외 처리한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
