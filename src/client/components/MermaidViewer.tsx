import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#050505',
    primaryColor: '#111111',
    primaryTextColor: '#D4D4D4',
    primaryBorderColor: '#333333',
    lineColor: '#555555',
    secondaryColor: '#0D0D0D',
    tertiaryColor: '#161616',
    edgeLabelBackground: '#0D0D0D',
    clusterBkg: '#0A0A0A',
    clusterBorder: '#222222',
    titleColor: '#A1A1AA',
  },
  securityLevel: 'loose',
});

interface MermaidViewerProps {
  chart: string;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      if (!chart || chart.trim() === '') {
        setSvgContent('');
        setError(null);
        return;
      }

      try {
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Invalid Mermaid syntax. Check class / relationship declarations.');
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div style={{ color: 'var(--danger)', padding: '16px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
        ⚠ {error}
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div style={{ color: 'var(--text-dim)', padding: '24px', textAlign: 'center', fontSize: '0.78rem' }}>
        Write Mermaid syntax above to preview the UML diagram.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '16px' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
