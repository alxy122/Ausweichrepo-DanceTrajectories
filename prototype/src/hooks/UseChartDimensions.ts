import { ResizeObserver } from '@juggle/resize-observer';
import { useState, useEffect, useRef } from 'react';

function combineChartDimensions(dimensions: any) {
  const parsedDimensions = {
    ...dimensions,
    marginTop: dimensions.marginTop || 40,
    marginRight: dimensions.marginRight || 40,
    marginBottom: dimensions.marginBottom || 40,
    marginLeft: dimensions.marginLeft || 40,
  };
  return {
    ...parsedDimensions,
    boundedHeight: Math.max(
      parsedDimensions.height -
        parsedDimensions.marginTop -
        parsedDimensions.marginBottom,
      0,
    ),
    boundedWidth: Math.max(
      parsedDimensions.width -
        parsedDimensions.marginLeft -
        parsedDimensions.marginRight,
      0,
    ),
  };
}

export default function useChartDimensions(passedSettings: any) {
  const ref = useRef<Element>(null);
  const dimensions = combineChartDimensions(passedSettings);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect((): any => {
    if (dimensions.width && dimensions.height) return [ref, dimensions];

    const element = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) return;
      if (!entries.length) return;

      const entry = entries[0];
      if (width !== entry.contentRect.width) {
        if (entry.contentRect.width > window.innerHeight - 200) {
          setWidth(window.innerHeight - 200);
          setHeight(window.innerHeight - 200);
        } else {
          setWidth(entry.contentRect.width);
          setHeight(entry.contentRect.width);
        }
      }
    });

    resizeObserver.observe(element as Element);

    return () => resizeObserver.unobserve(element as Element);
  }, [dimensions, width]);

  const newSettings = combineChartDimensions({
    ...dimensions,
    width: dimensions.width || width,
    height: dimensions.height || height,
  });

  return [ref, newSettings];
}
