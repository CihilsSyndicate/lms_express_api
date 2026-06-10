import { Router } from 'express';
import { getStudyRoomData } from './study-room.controller';

const studyRoomRouter = Router();

studyRoomRouter.get('/:modulId', getStudyRoomData);

export default studyRoomRouter;
