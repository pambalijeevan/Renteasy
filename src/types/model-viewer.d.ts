import 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        loading?: 'eager' | 'lazy';
        'camera-controls'?: boolean | string;
        'auto-rotate'?: boolean | string;
        'touch-action'?: string;
        'interaction-prompt'?: 'auto' | 'none' | 'when-focused';
        'orbit-sensitivity'?: number | string;
        'interpolation-decay'?: number | string;
        'camera-orbit'?: string;
        'field-of-view'?: string;
        'min-camera-orbit'?: string;
        'max-camera-orbit'?: string;
        'min-field-of-view'?: string;
        'max-field-of-view'?: string;
      };
    }
  }
}
