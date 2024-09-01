import React from 'react';

function Spinner() {
    const spinnerStyle = {
        border: '8px solid #f3f3f3', /* Light grey */
        borderTop: '8px solid #3498db', /* Blue */
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
        margin: 'auto'
    };

    const keyframesStyle = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    return (
        <div style={spinnerStyle}>
            <style>
                {keyframesStyle}
            </style>
        </div>
    );
}

export default Spinner;