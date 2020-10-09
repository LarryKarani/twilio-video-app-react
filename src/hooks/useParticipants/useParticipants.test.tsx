import { act, renderHook } from '@testing-library/react-hooks';
import EventEmitter from 'events';
import useDominantSpeaker from '../useDominantSpeaker/useDominantSpeaker';
import useParticipants from './useParticipants';
import useVideoContext from '../useVideoContext/useVideoContext';

jest.mock('../useVideoContext/useVideoContext');
jest.mock('../useDominantSpeaker/useDominantSpeaker');

const mockUseDominantSpeaker = useDominantSpeaker as jest.Mock<any>;
const mockedVideoContext = useVideoContext as jest.Mock<any>;

describe('the useParticipants hook', () => {
  let mockRoom: any;

  beforeEach(() => {
    mockRoom = new EventEmitter();
    mockRoom.participants = new Map([
      [0, 'participant1'],
      [1, 'participant2'],
    ]);
    mockedVideoContext.mockImplementation(() => ({
      room: mockRoom,
    }));
  });

  it('should return an array of mockParticipant.tracks by default', () => {
    const { result } = renderHook(useParticipants);
    expect(result.current).toEqual(['participant1', 'participant2']);
  });

  it('should return respond to "participantConnected" events', async () => {
    const { result } = renderHook(useParticipants);
    act(() => {
      mockRoom.emit('participantConnected', 'newParticipant');
    });
    expect(result.current).toEqual(['participant1', 'participant2', 'newParticipant']);
  });

  it('should return respond to "participantDisconnected" events', async () => {
    const { result } = renderHook(useParticipants);
    act(() => {
      mockRoom.emit('participantDisconnected', 'participant1');
    });
    expect(result.current).toEqual(['participant2']);
  });

  it('should reorder participants when the dominant speaker changes', () => {
    mockRoom.participants = new Map([
      [0, 'participant1'],
      [1, 'participant2'],
      [2, 'participant3'],
    ]);
    const { result, rerender } = renderHook(useParticipants);
    expect(result.current).toEqual(['participant1', 'participant2', 'participant3']);
    mockUseDominantSpeaker.mockImplementation(() => 'participant2');
    rerender();
    expect(result.current).toEqual(['participant2', 'participant1', 'participant3']);
    mockUseDominantSpeaker.mockImplementation(() => 'participant3');
    rerender();
    expect(result.current).toEqual(['participant3', 'participant2', 'participant1']);
    mockUseDominantSpeaker.mockImplementation(() => null);
    rerender();
    expect(result.current).toEqual(['participant3', 'participant2', 'participant1']);
  });

  it('should clean up listeners on unmount', () => {
    const { unmount } = renderHook(useParticipants);
    unmount();
    expect(mockRoom.listenerCount('participantConnected')).toBe(0);
    expect(mockRoom.listenerCount('participantDisconnected')).toBe(0);
  });
});
