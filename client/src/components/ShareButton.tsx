import React, { useState } from 'react';
import { Share, Checkmark } from '@carbon/icons-react';
import { Button } from '@carbon/react';

export const ShareButton: React.FC = () => {
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            hasIconOnly
            renderIcon={copied ? Checkmark : Share}
            tooltipPosition="bottom"
            iconDescription={copied ? "Copied!" : "Share Link"}
            kind="ghost"
            size="sm"
            onClick={handleShare}
            style={{ 
                color: copied ? '#42be65' : '#a56eff',
                border: '1px solid #393939' 
            }}
        />
    );
};
