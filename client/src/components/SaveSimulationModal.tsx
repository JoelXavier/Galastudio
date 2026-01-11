import React, { useState } from 'react';
import { Modal, TextInput, InlineNotification } from '@carbon/react';
import { useStore } from '../store/simulationStore';

interface SaveSimulationModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const SaveSimulationModal: React.FC<SaveSimulationModalProps> = ({ open, setOpen }) => {
    const serializeState = useStore(state => state.serializeState);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        if (!name.trim()) {
            setError("Please enter a name for your simulation.");
            return;
        }

        try {
            const currentState = serializeState();
            const timestamp = new Date().toISOString();
            const id = `sim_${Date.now()}`;
            
            const newEntry = {
                id,
                name,
                timestamp,
                data: currentState
            };

            // Get existing logs or init empty array
            const existingLogs = JSON.parse(localStorage.getItem('gala_build_log') || '[]');
            const updatedLogs = [newEntry, ...existingLogs];
            
            localStorage.setItem('gala_build_log', JSON.stringify(updatedLogs));
            
            // Reset and Close
            setName('');
            setError(null);
            setOpen(false);
            
            // Optional: Trigger a success toast via a global event or store action if needed?
            // For now, closing the modal implies success.
            
        } catch (err) {
            console.error("Failed to save to local storage", err);
            setError("Failed to save. Storage might be full.");
        }
    };

    return (
        <Modal
            open={open}
            onRequestClose={() => setOpen(false)}
            modalHeading="Log to Build History"
            modalLabel="Save Simulation"
            primaryButtonText="Save Entry"
            secondaryButtonText="Cancel"
            onRequestSubmit={handleSave}
            onSecondarySubmit={() => setOpen(false)}
            size="sm"
        >
            <p style={{ marginBottom: '1rem', fontSize: '14px', color: '#e0e0e0' }}>
                Save your current configuration to the local Build Log for easy retrieval.
            </p>
            
            <TextInput
                id="sim-name"
                labelText="Simulation Name"
                placeholder="e.g. Stable Milky Way Core"
                value={name}
                onChange={(e) => setName(e.target.value)}
                invalid={!!error}
                invalidText={error || ''}
            />
            
            {error && !name.trim() && (
                 <InlineNotification
                    kind="error"
                    subtitle={error}
                    hideCloseButton
                    style={{ marginTop: '1rem' }}
                />
            )}
        </Modal>
    );
};
