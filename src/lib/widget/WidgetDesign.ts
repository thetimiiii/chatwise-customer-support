interface WidgetConfig {
  primaryColor: string;
  position: 'left' | 'right';
  animations: boolean;
  fontFamily?: string;
  borderRadius?: string;
}

export class WidgetDesign {
  private config: WidgetConfig;
  private styleId = 'chatwise-widget-styles';

  constructor(config: Partial<WidgetConfig>) {
    this.config = {
      primaryColor: '#2563eb',
      position: 'right',
      animations: true,
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: '12px',
      ...config
    };
    this.initializeStyles();
  }

  private initializeStyles() {
    const existingStyle = document.getElementById(this.styleId);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = this.styleId;
    style.textContent = this.generateStyles();
    document.head.appendChild(style);
  }

  private generateStyles(): string {
    const { primaryColor, position, animations, fontFamily, borderRadius } = this.config;
    const shadow = 'rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px';
    
    return `
      .chatwise-widget {
        position: fixed;
        ${position}: 20px;
        bottom: 20px;
        font-family: ${fontFamily};
        z-index: 9999;
        ${animations ? 'transition: all 0.3s ease-in-out;' : ''}
      }

      .chatwise-widget-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${primaryColor};
        border: none;
        box-shadow: ${shadow};
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        ${animations ? 'transition: transform 0.2s ease-in-out;' : ''}
      }

      .chatwise-widget-button:hover {
        ${animations ? 'transform: scale(1.05);' : ''}
      }

      .chatwise-widget-window {
        position: absolute;
        bottom: 80px;
        ${position}: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: ${borderRadius};
        box-shadow: ${shadow};
        overflow: hidden;
        display: flex;
        flex-direction: column;
        ${animations ? 'transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);' : ''}
        opacity: 1;
        transform: translateY(0);
      }

      .chatwise-widget-window.hidden {
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
      }

      .chatwise-widget-header {
        background-color: ${primaryColor};
        color: white;
        padding: 16px;
        font-weight: 600;
        border-radius: ${borderRadius} ${borderRadius} 0 0;
      }

      .chatwise-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .chatwise-message {
        max-width: 80%;
        ${animations ? 'animation: messageSlideIn 0.3s ease-out;' : ''}
      }

      .chatwise-message-user {
        margin-left: auto;
        background-color: ${primaryColor};
        color: white;
        border-radius: ${borderRadius};
        padding: 8px 12px;
      }

      .chatwise-message-assistant {
        background-color: #f0f0f0;
        border-radius: ${borderRadius};
        padding: 8px 12px;
      }

      .chatwise-widget-input {
        padding: 16px;
        border-top: 1px solid #eee;
      }

      .chatwise-widget-input input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: ${borderRadius};
        outline: none;
        font-family: inherit;
      }

      .chatwise-widget-input input:focus {
        border-color: ${primaryColor};
      }

      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
  }

  updateConfig(newConfig: Partial<WidgetConfig>) {
    this.config = {
      ...this.config,
      ...newConfig
    };
    this.initializeStyles();
  }
}
