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
    notesId: number;
  };

  type CreateSongDto = {
    name: string;
    musicFileName: string;
    iconFileName: string;
    artist: string;
    copyright: string;
    genre: number;
    version: number;
    is_private: boolean;
  };

  type findAllNotesParams = {
    lv?: string;
    difficulty?: number;
    song?: number;
    uploader?: number;
    order?: string;
    skip?: number;
    take?: number;
  };

  type findAllSongParams = {
    search?: string;
    genre?: number;
    version?: number;
    uploader?: number;
    order?: string;
    skip?: number;
    take?: number;
  };

  type findOneNotesParams = {
    id: string;
  };

  type findOneSongParams = {
    id: string;
  };

  type findOneUserParams = {
    id: string;
  };

  type findPlayRecordParams = {
    user?: number;
    notes?: number;
    order?: string;
  };

  type InvitationCodeListDto = {
    list: string[];
  };

  type InviteDto = {
    amount: number;
    authLevel: number;
  };

  type LoginDto = {
    email: string;
    password: string;
  };

  type Notes = {
    id: number;
    lv: string;
    designer: string;
    lv_base: number;
    notes: string;
    difficulty: number;
    is_dx: boolean;
    utage_genre: number;
    is_official: boolean;
    is_private: boolean;
    song: Song;
    uploader: User;
    playRecords: string[];
    createtime: string;
    updatetime: string;
  };

  type PlayRecord = {
    id: number;
    point: number;
    user: User;
    notes: Notes;
    createtime: string;
    updatetime: string;
  };

  type PlayRecordDiffDto = {
    oldBestPoint: number;
    currentPoint: number;
  };

  type RegisterDto = {
    name: string;
    email: string;
    password: string;
    invitationCode: string;
  };

  type removeNotesParams = {
    id: string;
  };

  type removeSongParams = {
    id: string;
  };

  type RequestPasswordResetDto = {
    email: string;
  };

  type ResetPasswordDto = {
    email: string;
    token: string;
    newPassword: string;
  };

  type SetBannedDto = {
    id: number;
    banned: boolean;
  };

  type Song = {
    id: number;
    musicFileName: string;
    name: string;
    iconFileName: string;
    artist: string;
    copyright: string;
    genre: number;
    version: number;
    is_private: boolean;
    uploader: User;
    createtime: string;
    updatetime: string;
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

  type UpdateSongDto = {
    name?: string;
    musicFileName?: string;
    iconFileName?: string;
    artist?: string;
    copyright?: string;
    genre?: number;
    version?: number;
    is_private?: boolean;
  };

  type updateSongParams = {
    id: string;
  };

  type updateUserParams = {
    id: string;
  };

  type uploadsAppParams = {
    filename: string;
  };

  type User = {};

  type UserInfoDto = {
    id: number;
    name: string;
    avatarFileName: string;
    bio: string;
    banned: boolean;
    authLevel: number;
    createTime: string;
    lastLogin: string;
    uploadedNotes: string[];
    uploadedSongs: string[];
    playRecords: string[];
  };

  type UserInfoUpdateDto = {
    name: string;
    avatarFileName: string;
    bio: string;
  };

  type WhoamiDto = {
    id: number;
    email: string;
    sessionToken: string;
    authLevel: number;
    name: string;
    avatarFileName: string;
  };
}
