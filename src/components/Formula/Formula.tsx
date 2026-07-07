import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaProps {
  latex: string;
  displayMode?: boolean;
}

export function Formula({ latex, displayMode = false }: FormulaProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      katex.render(latex, ref.current, {
        displayMode,
        throwOnError: false,
      });
    }
  }, [latex, displayMode]);

  return <span ref={ref} />;
}
