import React from 'react';
import { Modal, Button } from '@carbon/react';
import { LogoGithub } from '@carbon/icons-react';
import { useAuthStore } from '../store/authStore';

interface AuthModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, setIsOpen }) => {
    const signInWithGithub = useAuthStore(state => state.signInWithGithub);
    const signInWithGoogle = useAuthStore(state => state.signInWithGoogle);

    const handleGithub = async () => {
        const { error } = await signInWithGithub();
        if (error) console.error("GitHub Login Failed", error);
    };

    const handleGoogle = async () => {
        const { error } = await signInWithGoogle();
        if (error) console.error("Google Login Failed", error);
    };

    return (
        <Modal
            open={isOpen}
            modalHeading="Sign in to GalaStudio"
            modalLabel="Authentication"
            primaryButtonText="Close"
            secondaryButtonText=""
            onRequestClose={() => setIsOpen(false)}
            onRequestSubmit={() => setIsOpen(false)}
            hasScrollingContent={false}
            size="xs"
            className="auth-modal"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                <p style={{ marginBottom: '1rem', color: '#c6c6c6' }}>
                    Sign in to save your simulations, track your orbital history, and collaborate with the community.
                </p>
                
                <Button 
                    kind="tertiary" 
                    renderIcon={LogoGithub} 
                    onClick={handleGithub}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Continue with GitHub
                </Button>

                <Button 
                    kind="tertiary" 
                    onClick={handleGoogle}
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    Continue with Google
                </Button>
            </div>
        </Modal>
    );
};
