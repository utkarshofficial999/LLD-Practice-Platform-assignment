import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle } from 'lucide-react';


interface MermaidViewerProps {
  chart: string;
  theme?: 'dark' | 'light';
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({ chart, theme = 'light' }) => {
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
        const isLight = theme === 'light';
        mermaid.initialize({
          startOnLoad: false,
          theme: isLight ? 'default' : 'dark',
          themeVariables: isLight
            ? {
                darkMode: false,
                background: '#FAFAFA',
                primaryColor: '#F4F4F5',
                primaryTextColor: '#18181B',
                primaryBorderColor: '#D4D4D8',
                lineColor: '#71717A',
                secondaryColor: '#E4E4E7',
                tertiaryColor: '#F4F4F5',
                edgeLabelBackground: '#FFFFFF',
                clusterBkg: '#F9F9F9',
                clusterBorder: '#E4E4E7',
                titleColor: '#27272A',
              }
            : {
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

        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) {
          setSvgContent(svg);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Invalid Mermaid syntax. Check class or relationship declarations.');
        }
      }
    };

    renderChart();
    return () => {
      isMounted = false;
    };
  }, [chart, theme]);

  if (error) {
    return (
      <div style={{ color: 'var(--danger)', padding: '16px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 6 }}>
        <AlertCircle size={14} /> {error}
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
