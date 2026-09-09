import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    darkMode: true,
    background: '#0d1322',
    primaryColor: '#6366f1',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#818cf8',
    lineColor: '#94a3b8',
    secondaryColor: '#0e1424',
    tertiaryColor: '#1e293b',
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
      <div style={{ color: '#fda4af', padding: '16px', fontSize: '0.84rem', fontFamily: 'monospace' }}>
        ⚠️ {error}
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div style={{ color: '#64748b', padding: '24px', textAlign: 'center', fontSize: '0.85rem' }}>
        No diagram defined. Switch to the <strong>Live UML Diagram</strong> tab to write or preview Mermaid code.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', overflow: 'auto', display: 'flex', justifyContent: 'center' }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};
