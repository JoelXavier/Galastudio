import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import { FrequencySpectrometer } from './FrequencySpectrometer';
import { PhaseSpacePanel } from './PhaseSpacePanel';
import { PotentialLegend } from './PotentialLegend';
import { Activity, ChartLine, Information } from '@carbon/icons-react';

export const AnalysisPanel: React.FC = () => {
    // Debug mount
    React.useEffect(() => console.log('AnalysisPanel Mounted'), []);

    return (
        <div className="gala-glass" style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px', // Ensure it's not off-screen
            width: '500px', 
            minHeight: '300px', 
            zIndex: 9000,   
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', 
            border: '1px solid rgba(165, 110, 255, 0.3)', // Ensure visible border
            background: 'rgba(22, 22, 22, 0.6)', // Ensure visible background if glass fails
            backdropFilter: 'blur(10px)', // Ensure glass effect
            borderRadius: '8px',
            cursor: 'default',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Tabs>
                <TabList aria-label="Analysis Modes" fullWidth>
                    <Tab renderIcon={ChartLine} style={{ color: '#f4f4f4' }}>Frequency</Tab>
                    <Tab renderIcon={Activity} style={{ color: '#f4f4f4' }}>Phase Space</Tab>
                    <Tab renderIcon={Information} style={{ color: '#f4f4f4' }}>Legend</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel style={{ padding: 0 }}>
                        <div style={{ padding: '0 1rem 1rem 1rem' }}>
                            <FrequencySpectrometer />
                        </div>
                    </TabPanel>
                    <TabPanel style={{ padding: 0 }}>
                        <div style={{ padding: '0 1rem 1rem 1rem' }}>
                            <PhaseSpacePanel />
                        </div>
                    </TabPanel>
                    <TabPanel style={{ padding: 0 }}>
                        <div style={{ padding: '1rem' }}>
                            <PotentialLegend />
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
    );
};
