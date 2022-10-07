import * as React from 'react';
import styled, { keyframes } from 'styled-components';
import { CameraSetting, CameraSettingDesc } from '../../../shared/settings/camera';
import { PhotoSetting, PhotoSettingDesc } from '../../../shared/settings/photo';
import { ActiveSetting, Filler } from './Camera';
import {
  AwbSetting,
  EffectSetting,
  ExposureSetting,
  ShutterSetting,
} from './settings/CameraSettings';
import { TimelapseSetting } from './settings/PhotoSettings';

//#region styled

const QuickSettingsPane = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const FadeIn = keyframes`
  from { opacity: 0 }
  to { opacity: 1 }
`;

const QuickSettingsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: auto;
  grid-column-gap: 2.5em;
  backdrop-filter: blur(3px);
  background-color: ${(p) => p.theme.LayerBackground};
  animation: 0.2s ${FadeIn};
  pointer-events: all;
  padding: 0.5em 1em;
`;

//#endregion

export interface QuickSettingsProps {
  activeSetting: ActiveSetting;
  camera: CameraSettingDesc;
  photo: PhotoSettingDesc;

  activateSetting: (setting: ActiveSetting) => void;
  updateCamera: (data: CameraSetting) => void;
  updatePhoto: (data: PhotoSetting) => void;
  setHorizontalLine: any;
  setVerticalLine: any;
  horizontalLine: number;
  verticalLine: number;
}

export const SettingsQuick: React.FC<QuickSettingsProps> = ({
  activeSetting,
  camera,
  photo,
  activateSetting,
  updateCamera,
  updatePhoto,
  setHorizontalLine,
  setVerticalLine,
  horizontalLine,
  verticalLine,
}) => (
  <QuickSettingsPane>
    <QuickSettingsContainer>
      {activeSetting === 'Exposure' && <ExposureSetting data={camera} updateData={updateCamera} />}
      {activeSetting === 'Shutter' && <ShutterSetting data={camera} updateData={updateCamera} />}
      {activeSetting === 'AwbAuto' && <AwbSetting data={camera} updateData={updateCamera} />}
      {activeSetting === 'Effect' && <EffectSetting data={camera} updateData={updateCamera} />}
      {activeSetting === 'Timelapse' && <TimelapseSetting data={photo} updateData={updatePhoto} />}

      <label style={{ color: 'white' }}>
        Horizontal Line:
        <input
          type="number"
          onChange={({ target }) => {
            setHorizontalLine(target.value);
          }}
          defaultValue={50}
          value={horizontalLine}
          // style={{ borderRadius: 10, background: 'snow', padding: 10, border: 'none', margin: 10 }}
          className="grid-setting-input"
        />
      </label>

      <label style={{ color: 'white' }}>
        Vertical Line:
        <input
          type="number"
          onChange={({ target }) => {
            setVerticalLine(target.value);
          }}
          defaultValue={50}
          value={verticalLine}
          // style={{ borderRadius: 10, background: 'snow', padding: 10, border: 'none', margin: 10 }}
          className="grid-setting-input"
        />
      </label>
    </QuickSettingsContainer>

    <Filler enableClick={true} onClick={() => activateSetting(undefined)} />
  </QuickSettingsPane>
);
