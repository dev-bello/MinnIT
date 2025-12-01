import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";

export const ConfirmSaveModal = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <h3 className="text-lg font-bold mb-4">Confirm Save</h3>
        <p className="mb-6">Are you sure you want to save these changes?</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onClose} className="button-secondary">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="button-primary">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
