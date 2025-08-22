// utils/textFormatter.tsx
import React from 'react';
import type { ReactElement } from 'react';

export const formatText = (text: string): ReactElement[] => {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    if (!line.trim()) return <br key={`br-${lineIndex}`} />;

    // Procesar patrones de formato
    const parts: (string | React.ReactElement)[] = [];
    let remaining = line;
    let elementKey = 0;

    while (remaining.length > 0) {
      // Buscar ***texto*** (negrita con color primario)
      const boldPrimaryMatch = remaining.match(/\*\*\*(.*?)\*\*\*/);
      if (boldPrimaryMatch && boldPrimaryMatch.index !== undefined) {
        // Agregar texto antes del match
        const beforeText = remaining.substring(0, boldPrimaryMatch.index);
        if (beforeText) {
          parts.push(beforeText);
        }

        // Agregar texto formateado
        parts.push(
          <strong
            key={`bold-primary-${lineIndex}-${elementKey++}`}
            className='font-bold text-primary'
          >
            {boldPrimaryMatch[1]}
          </strong>
        );

        // Continuar con el resto del texto
        remaining = remaining.substring(
          boldPrimaryMatch.index + boldPrimaryMatch[0].length
        );
        continue;
      }

      // Buscar **texto** (negrita normal)
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        const beforeText = remaining.substring(0, boldMatch.index);
        if (beforeText) {
          parts.push(beforeText);
        }

        parts.push(
          <strong
            key={`bold-${lineIndex}-${elementKey++}`}
            className='font-semibold'
          >
            {boldMatch[1]}
          </strong>
        );

        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Buscar *texto* (cursiva)
      const italicMatch = remaining.match(/\*(.*?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        const beforeText = remaining.substring(0, italicMatch.index);
        if (beforeText) {
          parts.push(beforeText);
        }

        parts.push(
          <em
            key={`italic-${lineIndex}-${elementKey++}`}
            className='italic text-muted-foreground'
          >
            {italicMatch[1]}
          </em>
        );

        remaining = remaining.substring(
          italicMatch.index + italicMatch[0].length
        );
        continue;
      }

      // Si no hay más patrones, agregar el resto del texto
      parts.push(remaining);
      break;
    }

    // Detectar si la línea es una lista
    const isListItem =
      line.trim().startsWith('•') || line.trim().match(/^[-*+]\s/);

    if (isListItem) {
      return (
        <div
          key={`list-item-${lineIndex}`}
          className='flex items-start space-x-2 mb-1'
        >
          <span className='text-primary font-bold mt-0.5'>•</span>
          <span className='flex-1'>
            {parts.map((part, partIndex) => (
              <React.Fragment key={`part-${lineIndex}-${partIndex}`}>
                {part}
              </React.Fragment>
            ))}
          </span>
        </div>
      );
    }

    return (
      <div key={`line-${lineIndex}`} className='mb-1'>
        {parts.map((part, partIndex) => (
          <React.Fragment key={`part-${lineIndex}-${partIndex}`}>
            {part}
          </React.Fragment>
        ))}
      </div>
    );
  });
};

// Función para limpiar texto de markdown para mostrar en notificaciones
export const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/•\s*/g, '- ')
    .trim();
};

// Función para detectar si el texto contiene datos estructurados
export const isStructuredData = (text: string): boolean => {
  const structuredPatterns = [
    /\*\*\*.*?\*\*\*.*?:\s*\d+/, // ***Campo***: valor
    /Total.*?:|Valor.*?:|Stock.*?:/, // Patrones de datos
  ];

  return structuredPatterns.some(pattern => pattern.test(text));
};

// Función para extraer métricas numéricas del texto
export const extractMetrics = (
  text: string
): Array<{ label: string; value: string }> => {
  const metrics: Array<{ label: string; value: string }> = [];
  const lines = text.split('\n');

  lines.forEach(line => {
    const metricMatch = line.match(/\*\*\*(.*?)\*\*\*:?\s*(.+)/);
    if (metricMatch) {
      metrics.push({
        label: metricMatch[1].trim(),
        value: metricMatch[2].trim(),
      });
    }
  });

  return metrics;
};
