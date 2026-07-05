export const DRAFT_ROOM_OPEN_CLASS = 'draft-room-open';

export const isDraftRoomBlockingSceneInput = () => (
    typeof document !== 'undefined'
    && document.documentElement.classList.contains(DRAFT_ROOM_OPEN_CLASS)
);
