import * as React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ButtonIcon } from '../styled/ButtonIcon';

const ToolbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  backdrop-filter: blur(5px);
  background-color: ${(p) => p.theme.LayerBackground};
  pointer-events: all;
  position: sticky;
  top: 0px;
  z-index: 1;
`;

const Button = styled(ButtonIcon)`
  padding: 0.8em;
`;

const Filler = styled.div`
  flex: 1;
`;

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

export interface Props {
  showActions: boolean;
  deleteFiles: () => void;
  clearSelection: () => void;
}

export const Toolbar: React.FC<Props> = ({ showActions, deleteFiles, clearSelection }) => (
  <ToolbarContainer>
    <Link to="/">
      <Button type="PhotoCamera" />
    </Link>

    <Filler />

    {showActions && (
      <ActionContainer>
        <Button type="Delete" onClick={deleteFiles} />
        <Button type="Clear" onClick={clearSelection} />
      </ActionContainer>
    )}
  </ToolbarContainer>
);
