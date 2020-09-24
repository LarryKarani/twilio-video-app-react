import React, { useState } from 'react';
import { makeStyles, Typography, Grid, Button } from '@material-ui/core';
import LocalVideoPreview from './LocalVideoPreview/LocalVideoPreview';
import SettingsIcon from '../SettingsIcon';
import SettingsDialog from '../../MenuBar/SettingsDialog/SettingsDialog';
import { Steps } from '../PreJoinScreens';
import ToggleAudioButton from '../../MenuBar/Buttons/ToggleAudioButton/ToggleAudioButton';
import ToggleVideoButton from '../../MenuBar/Buttons/ToggleVideoButton/ToggleVideoButton';
import { useAppState } from '../../../state';
import useVideoContext from '../../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles({
  gutterBottom: {
    marginBottom: '1em',
  },
  marginTop: {
    marginTop: '1em',
  },
  deviceButton: {
    width: '100%',
    border: '1px solid #aaa',
  },
});

interface DeviceSelectionScreenProps {
  name: string;
  roomName: string;
  setStep: (step: Steps) => void;
}

export default function DeviceSelectionScreen({ name, roomName, setStep }: DeviceSelectionScreenProps) {
  const classes = useStyles();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { getToken, isFetching } = useAppState();
  const { connect, isAcquiringLocalTracks, isConnecting } = useVideoContext();
  const disableButtons = isFetching || isAcquiringLocalTracks || isConnecting;

  const handleJoin = () => {
    getToken(name, roomName).then(token => connect(token));
  };

  return (
    <>
      <Typography variant="h5" className={classes.gutterBottom}>
        Join {roomName}
      </Typography>

      <Grid container spacing={2}>
        <Grid item sm={7}>
          <LocalVideoPreview identity={name} />
          <Button onClick={() => setIsSettingsOpen(true)} startIcon={<SettingsIcon />} className={classes.marginTop}>
            Audio and Video Settings
          </Button>
          <SettingsDialog open={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </Grid>
        <Grid item sm={5}>
          <ToggleAudioButton className={classes.deviceButton} disabled={disableButtons} />
          <ToggleVideoButton className={classes.deviceButton} disabled={disableButtons} />
          <Grid container justify="space-between" style={{ margin: '0.9em 0.6em' }}>
            <div>
              <Button variant="contained" onClick={() => setStep(Steps.roomNameStep)}>
                Cancel
              </Button>
            </div>
            <div>
              <Button variant="contained" color="primary" onClick={handleJoin} disabled={disableButtons}>
                Join Room
              </Button>
            </div>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}