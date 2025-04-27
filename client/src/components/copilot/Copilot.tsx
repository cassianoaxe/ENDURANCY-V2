import React, { useState } from 'react';
import CopilotButton from './CopilotButton';
import CopilotDialog from './CopilotDialog';

const Copilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <CopilotButton onClick={handleOpen} />
      <CopilotDialog isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export default Copilot;