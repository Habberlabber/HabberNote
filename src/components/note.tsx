import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatTextToMarkdown } from '../helpers/markdownFormatter';

import { getCharacterOffset, setCaretPosition } from '../helpers/cursorHandler';

export interface NoteComponentProps {
  defaultValue: string;
  onNoteUpdate: (newData: string) => void;
}

const Note = styled.div`
  width: 100vw;
  border-radius: 5px 5px 0 0;
  flex-grow: 1;
  background: transparent;
  resize: none;
  padding: 10px;
  font-size: 0.8rem;
  white-space: pre-wrap;
  overflow-y: auto;
  overflow-x: hidden;
`;

const saveDelay: number = 2 * 1000;

const NoteComponent = ({ defaultValue, onNoteUpdate }: NoteComponentProps) => {
  // State
  const [note, setNote] = useState(formatTextToMarkdown(''));
  const [cursorPos, setCursorPos] = useState(0);
  const [wasEnter, setWasEnter] = useState(false);

  // Reference to the Editable div, used to set the cursor position later!
  const noteFieldRef: React.RefObject<HTMLDivElement> = React.createRef();

  // Whenever the note state changes, set the cursor position in the text field
  useEffect(() => {
    // Since the state has been updated, set the cursor to the position from state
    setCaretPosition(noteFieldRef.current, cursorPos);
    const saveTimeout = setTimeout(() => {
      const newNoteText: string = noteFieldRef?.current?.innerText;
      onNoteUpdate(newNoteText);
    }, saveDelay);
    return () => clearTimeout(saveTimeout);
  }, [note]);

  useEffect(() => {
    if (defaultValue) setNote(formatTextToMarkdown(defaultValue));
  }, [defaultValue]);
  /**
   * This function handles the formatting of the text, whenever a character is added/removed
   * @param event The react form event for onInput
   */
  const handleChange = (event: React.FormEvent<HTMLDivElement>) => {
    // The element that triggered the event
    const inputElement: HTMLDivElement = event.currentTarget;
    // The inner text of the element
    const inputText: string = inputElement.innerText;
    // Get the cursors position in the field, and save it to state
    setCursorPos(getCharacterOffset(inputElement, wasEnter));
    // Disable the return key flag after use
    setWasEnter(false);
    // Format the raw text with html tags, and update state
    setNote(formatTextToMarkdown(inputText));
  };

  /**
   * Handles any Return keypress, bu setting a flag in state
   * This flag is then used to fix the cursor position after the markdown formatter is done.
   * @param event The react keyboard event triggered
   */
  const handleReturnKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // If the pressed key was enter, and shift was not held
    if (event.key === 'Enter' && event.shiftKey === false) {
      // Set the enter flag to true in state
      setWasEnter(true);
    }
  };

  return (
    <Note
      ref={noteFieldRef}
      onKeyPress={handleReturnKey}
      contentEditable="true"
      onInput={handleChange}
      dangerouslySetInnerHTML={{ __html: note }}
    />
  );
};

export default NoteComponent;
