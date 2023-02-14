declare namespace API {
  type CreateNotesDto = {
    lv: string;
    designer: string;
    lv_base: number;
    notes: string;
    difficulty: number;
    is_dx: boolean;
    utage_genre: number;
    songId: number;
    is_official: boolean;
    is_private: boolean;
  };

  type CreatePlayRecordDto = {
    point: number;
    userId: number;
    noteId: number;
  };

  type CreateSongDto = {
    name: string;
    artist: string;
    copyright: string;
    genre: number;
    version: number;
    is_private: boolean;
  };

  type CreateUserDto = {
    name: string;
    avatarId: number;
    email: string;
    p: string;
    authLevel: number;
  };

  type findOneNotesParams = {
    id: string;
  };

  type findOnePlayRecordParams = {
    id: string;
  };

  type findOneSongParams = {
    id: string;
  };

  type findOneUserParams = {
    id: string;
  };

  type removeNotesParams = {
    id: string;
  };

  type removePlayRecordParams = {
    id: string;
  };

  type removeSongParams = {
    id: string;
  };

  type removeUserParams = {
    id: string;
  };

  type UpdateNotesDto = {
    lv?: string;
    designer?: string;
    lv_base?: number;
    notes?: string;
    difficulty?: number;
    is_dx?: boolean;
    utage_genre?: number;
    songId?: number;
    is_official?: boolean;
    is_private?: boolean;
  };

  type updateNotesParams = {
    id: string;
  };

  type UpdatePlayRecordDto = {
    point?: number;
    userId?: number;
    noteId?: number;
  };

  type updatePlayRecordParams = {
    id: string;
  };

  type UpdateSongDto = {
    name?: string;
    artist?: string;
    copyright?: string;
    genre?: number;
    version?: number;
    is_private?: boolean;
  };

  type updateSongParams = {
    id: string;
  };

  type UpdateUserDto = {
    name?: string;
    avatarId?: number;
    email?: string;
    p?: string;
    authLevel?: number;
  };

  type updateUserParams = {
    id: string;
  };
}
