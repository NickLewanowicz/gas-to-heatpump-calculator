import { usePdf } from '@mikecousins/react-pdf';
import { useRef, useState } from 'react';

export interface HeatpumpData {
  name: string;
  data: any;
}

export function useHeatpumpData() {
  const [page, setPage] = useState(1);
  const canvasRef = useRef(null);

  const { pdfDocument, pdfPage } = usePdf({
    canvasRef,
    file: '/206414273.pdf',
    page,
  });

  return { pdfDocument, pdfPage };
}
