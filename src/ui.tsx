import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import appconfig from "./appconfig";
import { createSong } from "./services/api/createSong";
import { findAllUser } from "./services/api/findAllUser";
import { findOneSong } from "./services/api/findOneSong";
import { findOneUser } from "./services/api/findOneUser";
import { inviteAuth } from "./services/api/inviteAuth";
import { loginAuth } from "./services/api/loginAuth";
import { registerAuth } from "./services/api/registerAuth";
import { setBannedAuth } from "./services/api/setBannedAuth";
import { updateSong } from "./services/api/updateSong";
import { updateUser } from "./services/api/updateUser";
import { uploadMusicApp } from "./services/api/uploadMusicApp";
import { uploadPictureApp } from "./services/api/uploadPictureApp";

const User = 0;
const Mod = 5;
const Admin = 10;

const GenreList = ['pops & anime', 'niconico & vocaloid', 'touhou project', 'maimai'];

interface State {
    layout: 'landscape'|'portrait',
    landscapeLeftPanelsVisible: boolean,
    landscapeRightPanelsVisible: boolean,
    portraitCurrentTab: 'list'|'notes'|'details'
    currentModal: null|Modal,
    user: null|API.WhoamiDto
};
const defaultState: State = (() => {
    let user = readSavedUser();
    return {
        layout: 'landscape',
        landscapeLeftPanelsVisible: true,
        landscapeRightPanelsVisible: true,
        portraitCurrentTab: 'list',
        currentModal: (user != null)? null: {name:'login'},
        user: user
    }
})();
const Context = createContext<{
    state: State,
    setState: (newState: State) => void,
    onPlay: () => void
}>(null as any);

function showError(err: any) {
    if (err.message) {
        alert(err.message)
    } else if (err.data) {
        if (err.data.message instanceof Array) {
            alert(err.data.message[0]);
        } else {
            alert(err.data.message || err.statusText);
        }
    } else if (err.statusText) {
        alert(err.statusText);
    } else {
        alert(err);
    }
}
function readSavedUser(): null|API.WhoamiDto {
    for (let item of document.cookie.split('; ')) {
        if (item.startsWith('user=')) {
            try {
                return JSON.parse(decodeURIComponent(item.split('=')[1]));
            } catch(err) {
                return null;
            }
        }
    }
    return null;
}
function writeSavedUser(user: null|API.WhoamiDto) {
    document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; SameSite=Strict; Max-Age=31536000; Secure`;
}
function avatarUrl(avatarFileName: string|undefined) {
    if (avatarFileName) {
        return `${appconfig.apiBaseURL}/api/v1/uploads/${avatarFileName}`;
    } else {
        const DefaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmVyc2lvbj0iMS4xIj4KICAgIDxyZWN0IHg9IjAiIHk9IjAiIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgc3Ryb2tlPSJsaWdodGdyYXkiIGZpbGw9ImRhcmtncmF5IiAvPgo8L3N2Zz4=';
        return DefaultAvatar;
    }
}
function formCloseGuard(pending: boolean, dirty: boolean): () => boolean {
    return (): boolean => {
        if (pending) {
            return false;
        }
        if (dirty) {
            return window.confirm('Discard changes?');
        }
        return true;
    }
}

function Link(props: { onClick: () => void, children: string|JSX.Element, style?: React.CSSProperties, enabled?: boolean }): JSX.Element {
    let anchorRef = useRef<HTMLAnchorElement>(null);
    useEffect(() => {
        if (props.enabled ?? true) {
            // see: https://github.com/facebook/react/issues/16382
            anchorRef.current!.href = 'javascript:void(0)';
        } else {
            anchorRef.current!.removeAttribute('href');
        }
    }, [props.enabled]);
    return <a ref={anchorRef} onClick={props.onClick} style={props.style}>{props.children}</a>
}
function SubmitLink(props: { onClick: () => void, children: string|JSX.Element, style?: React.CSSProperties, pending: boolean }): JSX.Element {
    return <Link enabled={!props.pending} onClick={props.onClick} style={props.style}>
        {props.pending? 'loading...': props.children}
    </Link>
}
function FileInputWrapper(props: { children: JSX.Element, pending: boolean }): JSX.Element {
    return <>
        <label className="fileInputWrapper" style={{ display: props.pending? 'none': undefined }}>
            <span className="appearLikeLink">Choose File...</span>
            {props.children}
        </label>
        { props.pending? <span>uploading...</span>: <></> }
    </>
}

function Panel(props: { id?: string, style?: React.CSSProperties, children: JSX.Element|JSX.Element[] }): JSX.Element {
    return <div id={props.id} style={{ background: 'white', boxShadow: '1px 3px 0px rgba(0, 0, 0, 0.4)', borderRadius: '5px', padding: '5px', margin: '5px 5px', ...(props.style ?? {}) }}>
        { props.children }
    </div>
}

type ModalName = 'register'|'login'|'menu'|'profile'|'profile_edit'|'song_edit'|'notes_edit'|'invite'|'users'|'filters';
interface Modal { name: ModalName, argument?: any };
function LinkToModal(props: { name: ModalName, argument?: any, children: string|JSX.Element, style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    return <Link onClick={() => ctx.setState({ ...ctx.state, currentModal: {name:props.name, argument:props.argument} })} style={props.style}>
        {props.children}
    </Link>
}
function Modal(props: { name: ModalName, title: string, children: JSX.Element|JSX.Element[], closeGuard?: () => boolean }): JSX.Element {
    let ctx = useContext(Context);
    let close = () => {
        if (props.closeGuard) {
            if (!(props.closeGuard())) {
                return;
            }
        }
        ctx.setState({ ...ctx.state, currentModal: null })
    }
    return ReactDOM.createPortal(<div style={{ display: (ctx.state.currentModal?.name == props.name)? 'block': 'none' }}>
        <div style={{ position: 'fixed', backgroundColor: 'black', opacity: '0.5', top: '0', left: '0', bottom: '0', right: '0' }}></div>
        <Panel style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '110%', fontWeight: 'bold' }}>{ props.title }</span>
                <Link onClick={() => {close()}}>Close</Link>
            </div>
            <div>{ props.children }</div>
        </Panel>
    </div>, document.getElementById('portal')!);
}

function RegisterModal(): JSX.Element {
    let ctx = useContext(Context);
    let [pending, setPending] = useState(false);
    let codeInputRef = useRef<HTMLInputElement>(null);
    let emailInputRef = useRef<HTMLInputElement>(null);
    let nameInputRef = useRef<HTMLInputElement>(null);
    let passwordInputRef = useRef<HTMLInputElement>(null);
    let passwordConfirmRef = useRef<HTMLInputElement>(null);
    let register = async () => {
        let codeInput = codeInputRef.current!;
        let emailInput = emailInputRef.current!;
        let nameInput = nameInputRef.current!;
        let passwordInput = passwordInputRef.current!;
        let passwordConfirm = passwordConfirmRef.current!;
        if (passwordInput.value != passwordConfirm.value) {
            alert('Password inputs are not consistent.');
            return;
        }
        setPending(true);
        try {
            let user = await registerAuth({
                invitationCode: codeInput.value,
                email: emailInput.value,
                name: nameInput.value,
                password: passwordInput.value
            });
            codeInput.value = '';
            emailInput.value = '';
            nameInput.value = '';
            passwordInput.value = '';
            passwordConfirm.value = '';
            ctx.setState({ ...ctx.state, user, currentModal: null });
            writeSavedUser(user);
        } catch(err) {
            showError(err);
        } finally {
            setPending(false);
        }
    };
    return <Modal name="register" title={'Register'} closeGuard={() => !pending}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 20px' }}>
            <table><tbody>
                <tr><td>InviteCode:</td><td><input ref={codeInputRef} type="text"></input></td></tr>
                <tr><td>Email:</td><td><input ref={emailInputRef} type="email"></input></td></tr>
                <tr><td>Name:</td><td><input ref={nameInputRef} type="text"></input></td></tr>
                <tr><td>Pasword:</td><td><input ref={passwordInputRef} type="password"></input></td></tr>
                <tr><td>Confirm:</td><td><input ref={passwordConfirmRef} type="password" onKeyDown={(ev) => { if(ev.key == 'Enter') { register(); } }}></input></td></tr>
            </tbody></table>
            <div style={{ textAlign: 'center' }}>
                <SubmitLink pending={pending} onClick={() => { register() }}>
                    Register
                </SubmitLink>
            </div>
        </div>
    </Modal>
}
function LoginModal(): JSX.Element {
    let ctx = useContext(Context);
    let [pending, setPending] = useState(false);
    let emailInputRef = useRef<HTMLInputElement>(null);
    let passwordInputRef = useRef<HTMLInputElement>(null);
    let login = async () => {
        let emailInput = emailInputRef.current!;
        let passwordInput = passwordInputRef.current!;
        setPending(true);
        try {
            let user = await loginAuth({
                email: emailInput.value,
                password: passwordInput.value
            });
            emailInput.value = '';
            passwordInput.value = '';
            ctx.setState({ ...ctx.state, user, currentModal: null });
            writeSavedUser(user);
        } catch(err) {
            showError(err)
        } finally {
            setPending(false);
        }
    };
    return <Modal name={'login'} title={'Login'} closeGuard={() => !pending}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px 20px' }}>
            <table><tbody>
                <tr><td>Email:</td><td><input ref={emailInputRef} type="email"></input></td></tr>
                <tr><td>Pasword:</td><td><input ref={passwordInputRef} type="password" onKeyDown={(ev) => { if(ev.key == 'Enter') { login(); } }}></input></td></tr>
            </tbody></table>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <SubmitLink pending={pending} onClick={() => { login() }}>
                    Login
                </SubmitLink>
                <LinkToModal name="register" style={{ fontSize: '80%', marginTop: '8px' }}>
                    Register with an Invitation Code
                </LinkToModal>
            </div>
        </div>
    </Modal>
}

function MenuModal(): JSX.Element {
    let ctx = useContext(Context);
    let items: [ModalName,string,boolean][] = [
        ['profile','My Profile',false],
        ['song_edit','Add New Song',false],
        ['notes_edit','Add New Notes',false],
        ['invite','Generate Invitation Codes',true],
        ['users','List All Users',true]
    ];
    return <Modal name={'menu'} title={'Menu'}>
        <div>{ items.map(([name,title,admin]) =>
            <LinkToModal name={name} key={name} style={{ display: (admin && ctx.state.user?.authLevel != Admin)? 'none': 'block' }} >
                <div className="menuItem" style={{ minWidth: (ctx.state.layout == 'landscape')? '30vw': '60vw', textAlign: 'center', padding: '8px 0px', margin: '8px 0px' }}>
                    {title}
                </div>
            </LinkToModal>
        )}</div>
    </Modal>
}
function ProfileModal(): JSX.Element {
    let ctx = useContext(Context);
    let [pending, setPending] = useState(false);
    let [userInfo, setUserInfo] = useState<null|API.UserInfoDto>(null);
    useEffect(() => {
        if (ctx.state.currentModal?.name == 'profile') {
            let currentUser = ctx.state.user!;
            let userId: number = ctx.state.currentModal.argument ?? currentUser.id;
            (async () => {
                setPending(true);
                try {
                    setUserInfo(await findOneUser(
                        { id: String(userId) },
                        { token: currentUser.sessionToken }
                    ));
                } catch(err) {
                    showError(err);
                    setUserInfo(null);
                } finally {
                    setPending(false);
                }
            })();
        } else {
            setUserInfo(null);
        }
    }, [ctx.state.currentModal]);
    let edit = () => {
        ctx.setState({ ...ctx.state, currentModal: {
            name: 'profile_edit',
            argument: userInfo!
        }})
    };
    let setBanned = async (banned: boolean) => {
        setPending(true);
        try {
            await setBannedAuth(
                { id: userInfo!.id, banned },
                { token: ctx.state.user!.sessionToken }
            );
            setUserInfo({ ...userInfo!, banned });
        } catch(err) {
            showError(err);
        } finally {
            setPending(false);
        }
    }
    // TODO: relations(songs,notes,playrecords)
    return <Modal name={'profile'} title={'Profile'} closeGuard={() => !pending}>
        <div style={{ minWidth: (ctx.state.layout == 'landscape')? '40vw': '80vw', maxHeight: '60vh', overflow: 'auto', margin: '10px 0px' }}>
            {(userInfo == null)? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><h1>Loading...</h1></div>:
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '64px', height: '64px' }}>
                            <img src={avatarUrl(userInfo.avatarFileName)} style={{ width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ marginLeft: '5px' }}>
                            <div style={{ fontSize: '110%', fontWeight: 'bold' }}>{userInfo.name}</div>
                            <div style={{ fontSize: '90%', color: 'gray' }}>UID {userInfo.id}{ (userInfo.authLevel == Admin)? ' (admin)': (userInfo.authLevel == Mod)? ' (mod)': '' }</div>
                            <div style={{ fontSize: '90%', color: 'gray' }}>registered {(new Date(userInfo.createTime)).toDateString()}</div>
                        </div>
                    </div>
                    <div>
                        { (userInfo.id == ctx.state.user!.id)?
                            <div><Link onClick={() => {edit()}} style={{ margin: '0px 10px' }}>Edit My Profile</Link></div>: <></> }
                        { (userInfo.banned)?
                            <div style={{ color: 'red' }}>[Banned]</div>: <></> }
                        { ((ctx.state.user!.authLevel == Mod || ctx.state.user!.authLevel == Admin) && (userInfo.id != ctx.state.user!.id) && (userInfo.authLevel == User))?
                            (userInfo.banned? <SubmitLink pending={pending} onClick={() => {setBanned(false);}}>Unban</SubmitLink>: <SubmitLink pending={pending} onClick={() => {setBanned(true);}}>Ban</SubmitLink>): <></> }
                    </div>
                </div>
                <div style={{ fontSize: '90%', padding: '5px 10px', margin: '5px 0px', backgroundColor: 'hsl(0,0%,94%)', color: 'hsl(0,0%,35%)' }}>{ userInfo.bio || '(bio is not set)' }</div>
                <div>
                    <div style={{ marginBottom: '5px' }}>
                        <div><b>◆ Songs</b></div>
                        <div>{ userInfo.uploadedSongs.map((song_) => {
                            let song = song_ as any as API.Song;
                            return <div key={song.id}>
                                { (userInfo!.id == ctx.state.user!.id)? <LinkToModal name="song_edit" argument={song.id}>{song.name}</LinkToModal>: <span>{song.name}</span> }
                            </div>
                        }) }</div>
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                        <div><b>◆ Notes</b></div>
                        <div>...</div>
                    </div>
                    <div style={{ marginBottom: '5px' }}>
                        <div><b>◆ Records</b></div>
                        <div>...</div>
                    </div>
                </div>
            </div>}
        </div>
    </Modal>
}
function ProfileEditModal(): JSX.Element {
    let ctx = useContext(Context);
    let [uploadPending, setUploadPending] = useState(false);
    let [submitPending, setSubmitPending] = useState(false);
    let pending = uploadPending || submitPending;
    let [dirty, setDirty] = useState(false);
    let [userInfo, setUserInfo] = useState<null|API.UserInfoDto>(null);
    let avatarImageRef = useRef<HTMLImageElement>(null);
    let [avatarFileName, setAvatarFileName] = useState<string>('');
    let avatarFileInputRef = useRef<HTMLInputElement>(null);
    let nameInputRef = useRef<HTMLInputElement>(null);
    let bioInputRef = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        if (ctx.state.currentModal?.name == 'profile_edit') {
            setUserInfo(ctx.state.currentModal.argument!);
        } else {
            setUserInfo(null);
        }
    }, [ctx.state.currentModal]);
    useEffect(() => {
        if (userInfo != null) {
            avatarImageRef.current!.src = avatarUrl(userInfo?.avatarFileName);
            setAvatarFileName(userInfo.avatarFileName);
            nameInputRef.current!.value = userInfo?.name ?? '';
            bioInputRef.current!.value = userInfo?.bio ?? '';
            setDirty(false);
        }
    }, [userInfo])
    let handleAvatarChange = async () => {
        setUploadPending(true);
        let file = avatarFileInputRef.current!.files![0];
        try {
            let blobUrl = URL.createObjectURL(file);
            let fileName = await uploadPictureApp({}, file, { token: ctx.state.user!.sessionToken });
            avatarImageRef.current!.src = blobUrl;
            setAvatarFileName(fileName);
            setDirty(true);
        } catch(err) {
            showError(err);
        } finally {
            setUploadPending(false);
        }
    }
    let handleTextChange = () => {
        setDirty(true);
    }
    let submit = async () => {
        setSubmitPending(true);
        let userId = userInfo!.id;
        let name = nameInputRef.current!.value;
        let bio = bioInputRef.current!.value;
        try {
            await updateUser(
                { id: String(userId) },
                { name, bio, avatarFileName },
                { token: ctx.state.user!.sessionToken }
            );
            let updatedUser = { ...ctx.state.user!, name, bio, avatarFileName };
            ctx.setState({ ...ctx.state, user: updatedUser, currentModal: {name:'profile',argument:userId} });
            writeSavedUser(updatedUser);
        } catch(err) {
            showError(err);
        } finally {
            setSubmitPending(false);
        }
    }
    return <Modal name={'profile_edit'} title={'Edit My Profile'} closeGuard={formCloseGuard(pending, dirty)}>
        <div>
            {(userInfo == null)? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><h1>Loading...</h1></div>:
            <div>
                <table style={{ marginTop: '10px' }}><tbody>
                    <tr><td>Avatar:</td><td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{ width: '64px', height: '64px' }}>
                                <img ref={avatarImageRef} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <div style={{ flexGrow: '1', padding: '0px 8px' }}>
                                <FileInputWrapper pending={uploadPending}>
                                    <input type="file" accept=".png,.gif,.jpg" ref={avatarFileInputRef} onChange={() => {handleAvatarChange()}}></input>
                                </FileInputWrapper>
                            </div>
                        </div>
                    </td></tr>
                    <tr><td>Name:</td><td>
                        <input type="text" ref={nameInputRef} onChange={() => {handleTextChange()}}></input>
                    </td></tr>
                    <tr><td>Bio:</td><td>
                        <textarea ref={bioInputRef} style={{ resize: 'none', boxSizing: 'border-box', width: '100%', minWidth: '30vw' }} onChange={() => {handleTextChange()}}></textarea>
                    </td></tr>
                </tbody></table>
                <div style={{ textAlign: 'center', padding: '5px 0px' }}>
                    <SubmitLink pending={submitPending} onClick={() => {submit()}}>Apply Changes</SubmitLink>
                </div>
            </div>}
        </div>
    </Modal>
}
function SongEditModal(): JSX.Element {
    let ctx = useContext(Context);
    let [loadPending, setLoadPending] = useState(false);
    let [musicUploadPending, setMusicUploadPending] = useState(false);
    let [iconUploadPending, setIconUploadPending] = useState(false);
    let [submitPending, setSubmitPending] = useState(false);
    let pending = loadPending || musicUploadPending || iconUploadPending || submitPending;
    let [dirty, setDirty] = useState(false);
    let [id, setId] = useState<null|number>(null);
    let [song, setSong] = useState<null|API.CreateSongDto>(null);
    useEffect(() => {
        if (ctx.state.currentModal?.name == 'song_edit') {
            let songId: undefined|number = ctx.state.currentModal.argument;
            if (songId != undefined) {
                (async () => {
                    setLoadPending(true);
                    try {
                        let song = await findOneSong(
                            { id: String(songId) },
                            { token: ctx.state.user!.sessionToken }
                        );
                        setId(songId);
                        setSong({ name: song.name, musicFileName: song.musicFileName, iconFileName: song.iconFileName, artist: song.artist, copyright: song.copyright, genre: song.genre, version: song.version, is_private: song.is_private });
                        setDirty(false);
                    } catch(err) {
                        showError(err);
                    } finally {
                        setLoadPending(false);
                    }
                })();
            } else {
                setId(null);
                setSong({ name: '', musicFileName: '', iconFileName: '', artist: '', copyright: '', genre: 0, version: 0, is_private: false });
                setDirty(false);
            }
        } else {
            setId(null);
            setSong(null);
        }
    }, [ctx.state.currentModal]);
    let changeMusic = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        setMusicUploadPending(true);
        let file = ev.target.files![0]!;
        try {
            let musicFileName = await uploadMusicApp({}, file, { token: ctx.state.user!.sessionToken });
            setSong({ ...song!, musicFileName });
            setDirty(true);
        } catch(err) {
            showError(err);
        } finally {
            setMusicUploadPending(false);
        }
    };
    let changeIcon = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        setIconUploadPending(true);
        let file = ev.target.files![0]!;
        try {
            let iconFileName = await uploadPictureApp({}, file, { token: ctx.state.user!.sessionToken });
            setSong({ ...song!, iconFileName });
            setDirty(true);
        } catch(err) {
            showError(err);
        } finally {
            setIconUploadPending(false);
        }
    };
    let submit = async () => {
        setSubmitPending(true);
        try {
            if (id == null) {
                await createSong(song!, { token: ctx.state.user!.sessionToken });
            } else {
                await updateSong({ id: String(id) }, song!, { token: ctx.state.user!.sessionToken });
            }
            ctx.setState({ ...ctx.state, currentModal: {name:'profile',argument:ctx.state.user!.id} });
        } catch(err) {
            showError(err);
        } finally {
            setSubmitPending(false);
        }
    };
    let writeValueTo = (key: keyof API.CreateSongDto) => (ev: React.ChangeEvent<HTMLInputElement>|React.ChangeEvent<HTMLSelectElement>) => {
        if (typeof song![key] == 'number') {
            let value = Number(ev.target.value);
            setSong({ ...song!, [key]: value });
        } else if (typeof song![key] == 'boolean') {
            let value = (ev.target as HTMLInputElement).checked;
            setSong({ ...song!, [key]: value });
        } else if (typeof song![key] == 'string') {
            let value = ev.target.value;
            setSong({ ...song!, [key]: value });
        }
        setDirty(true);
    };
    return <Modal name="song_edit" title={(id == null)? 'Add New Song': 'Edit Song'} closeGuard={formCloseGuard(pending, dirty)}>
        { (song == null)? <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}><h1>Loading...</h1></div>:
        <div>
            <table style={{ marginTop: '10px' }}><tbody>
                <tr><td>Music:</td><td>
                    { song.musicFileName? <div><audio src={`${appconfig.apiBaseURL}/api/v1/uploads/${song.musicFileName}`} controls={true} /></div>: <></> }
                    <FileInputWrapper pending={musicUploadPending}><input type="file" accept=".mp3" onChange={changeMusic}></input></FileInputWrapper>
                </td></tr>
                <tr><td>Icon:</td><td>
                    { song.iconFileName? <div><img src={`${appconfig.apiBaseURL}/api/v1/uploads/${song.iconFileName}`} style={{ width: '32px', height: '32px' }} /></div>: <></> }
                    <FileInputWrapper pending={iconUploadPending}><input type="file" accept=".png,.gif,.jpg" onChange={changeIcon}></input></FileInputWrapper>
                </td></tr>
                <tr><td>Name:</td><td><input type="text" value={song.name} onChange={writeValueTo('name')} style={{ boxSizing: 'border-box', width: '100%' }}></input></td></tr>
                <tr><td>Artist:</td><td><input type="text" value={song.artist} onChange={writeValueTo('artist')} style={{ boxSizing: 'border-box', width: '100%' }}></input></td></tr>
                <tr><td>Copyright:</td><td><input type="text" value={song.copyright} onChange={writeValueTo('copyright')} style={{ boxSizing: 'border-box', width: '100%' }}></input></td></tr>
                <tr><td>Genre:</td><td><select value={song.genre} onChange={writeValueTo('genre')}>{GenreList.map((genre,i) => <option key={i} value={i}>{genre}</option>)}</select></td></tr>
                <tr><td>Private:</td><td><input type="checkbox" checked={song.is_private} onChange={writeValueTo('is_private')}></input></td></tr>
            </tbody></table>
            <div style={{ textAlign: 'center', padding: '5px 0px' }}>
                <SubmitLink pending={submitPending} onClick={() => {submit()}}>{(id == null)? 'Submit': 'Apply Changes'}</SubmitLink>
            </div>
        </div>}
    </Modal>
}
function NotesEditModal(): JSX.Element {
    // TODO
    return <Modal name="notes_edit" title="Add New Notes">
        <h1>Notes Info</h1>
    </Modal>
}
function InviteModal(): JSX.Element {
    let ctx = useContext(Context);
    let [generatedCodes, setGeneratedCodes] = useState('');
    let [authLevel, setAuthLevel] = useState(0);
    let [amount, setAmount] = useState(1);
    let priviledgedColor = 'hsl(0, 90%, 60%)';
    let authLevelDesc: { [key:number]: string } = {[User]:'User', [Mod]:'Mod', [Admin]:'Admin'};
    let [pending, setPending] = useState(false)
    let generate = async () => {
        setPending(true);
        try {
            let payload = { authLevel, amount };
            let res = await inviteAuth(payload, { token: ctx.state.user!.sessionToken });
            setGeneratedCodes(`// ${authLevelDesc[payload.authLevel]} * ${payload.amount}\n${res.list.join('\n')}`);
        } catch(err) {
            showError(err);
        } finally {
            setPending(false);
        }
    };
    return <Modal name="invite" title="Invite" closeGuard={() => !pending}>
        <div style={{ display: 'flex', minWidth: (ctx.state.layout == 'landscape')? '30vw': '75vw' }}>
            <table><tbody>
                <tr style={{ color: (authLevel != User)? priviledgedColor: undefined }}>
                    <td>Priviledge:</td>
                    <td><select value={authLevel} onChange={ev => {setAuthLevel(Number(ev.target.value))}} style={{ color: (authLevel != User)? priviledgedColor: undefined }}>
                        { Object.keys(authLevelDesc).map(lv =>
                        <option key={lv} value={lv} style={{ color: 'black' }}>{authLevelDesc[Number(lv)]}</option>) }
                    </select></td>
                </tr>
                <tr>
                    <td>Amount:</td>
                    <td><select value={amount} onChange={ev => {setAmount(Number(ev.target.value))}}>
                        <option value="1">1</option>
                        <option value="10">10</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select></td>
                </tr>
            </tbody></table>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0px 15px' }}>
                <SubmitLink pending={pending} onClick={() => {generate()}}>Generate Codes</SubmitLink>
            </div>
        </div>
        <div>
            <textarea value={generatedCodes} readOnly={true} placeholder="Generated Codes" style={{ marginTop: '5px', boxSizing: 'border-box', width: '100%', resize: 'none', minHeight: '20vh' }}></textarea>
        </div>
    </Modal>
}
function UsersModal(): JSX.Element {
    let ctx = useContext(Context);
    let [users, setUsers] = useState<API.UserInfoDto[]>([]);
    let [pending, setPending] = useState(false);
    useEffect(() => {
        if (ctx.state.currentModal?.name == 'users') {
            (async () => {
                setPending(true);
                try {
                    setUsers(await findAllUser({ token: ctx.state.user!.sessionToken }));
                } catch(err) {
                    showError(err);
                } finally {
                    setPending(false);
                }
            })();
        } else {
            setUsers([]);
        }
    }, [ctx.state.currentModal]);
    return <Modal name="users" title="Users" closeGuard={() => !pending}>
        <div style={{ minWidth: (ctx.state.layout == 'landscape')? '30vw': '75vw', maxHeight: '65vh', overflow: 'auto' }}>
            { (users.length == 0)? <h1>Loading...</h1>:
                <table className="userTable"><tbody>
                    <tr>
                        <th>Avatar</th>
                        <th>UID</th>
                        <th>Name</th>
                        <th>Registered</th>
                        <th>Last Login</th>
                    </tr>
                    { users.map(user => <tr>
                        <td><div style={{ width: '32px', height: '32px' }}><img src={avatarUrl(user.avatarFileName)} style={{ width: '100%', height: '100%' }} /></div></td>
                        <td><div>{ user.id }</div></td>
                        <td><div><LinkToModal name="profile" argument={user.id}>{ user.name }</LinkToModal></div></td>
                        <td><div>{ (new Date(user.createTime)).toDateString() }</div></td>
                        <td><div>{ (new Date(user.lastLogin)).toDateString() }</div></td>
                    </tr>) }
                </tbody></table>}
        </div>
    </Modal>
}

function FiltersModal(): JSX.Element {
    return <Modal name={'filters'} title={'Filters'}>
        {/* TODO */}
    </Modal>
}

function PortraitLayoutTab(props: { tab: 'list'|'notes'|'details', text: string }): JSX.Element {
    let ctx = useContext(Context);
    return <div><Link enabled={ctx.state.portraitCurrentTab != props.tab} onClick={() => ctx.setState({ ...ctx.state, portraitCurrentTab: props.tab })}>{props.text}</Link></div>
}
function PortaritLayoutTabs(): JSX.Element {
    let ctx = useContext(Context);
    return (<div style={{ display: (ctx.state.layout == 'portrait')? 'flex': 'none', justifyContent: 'space-around', marginBottom: '8px' }}>
        <PortraitLayoutTab tab="list" text="List" />
        <PortraitLayoutTab tab="notes" text="Notes" />
        <PortraitLayoutTab tab="details" text="Details" />
    </div>)
}

function UserPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let hide = (ctx.state.layout == 'landscape' && !ctx.state.landscapeLeftPanelsVisible);
    let logout = () => {
        if (window.confirm('logout?')) {
            ctx.setState({ ...ctx.state, user: null, currentModal: {name:'login'} });
            writeSavedUser(null);
        }
    }
    return <Panel style={{ display: hide? 'none': 'block', overflow: 'hidden', ...(props.style ?? {}) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                    <div style={{ marginRight: '5px', height: '20px', width: '20px', flexShrink: '0' }}>
                        <img src={avatarUrl(ctx.state.user?.avatarFileName)} style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {ctx.state.user?.name ?? 'Guest'}
                    </div>
            </div>
            <div>
                { (ctx.state.user != null)? <LinkToModal name="menu">Menu...</LinkToModal>: <LinkToModal name="login">Login...</LinkToModal> }
                { ' ' }
                { (ctx.state.user != null)? <Link onClick={() => { logout(); }}>Logout...</Link>: <LinkToModal name="register">Register...</LinkToModal> }
            </div>
        </div>
    </Panel>
}

function SongListPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let play = () => {
        if (ctx.state.user == null) {
            // play _notesInDev
            ctx.onPlay();
        } else {
            // load song and notes ...
        }
    };
    let hide = (
        (ctx.state.layout == 'landscape' && !ctx.state.landscapeLeftPanelsVisible)
        || (ctx.state.layout == 'portrait' && ctx.state.portraitCurrentTab != 'list')
    );
    let difficultyColors: { [key:string]: string } = {
        'easy': '#6FE163',
        'advanced': '#F8DF3A',
        'expert': '#FF828E',
        'master': '#C27FF4'
    }
    let dummyNotes: Array<{ difficulty: string, lvBase: number, lv: string, name: string, official: boolean, uploader: string }> = [
        { difficulty: 'easy', lvBase: 3, lv: '3.0', name: '', official: true, uploader: 'admin' },
        { difficulty: 'advanced', lvBase: 6, lv: '6.2', name: '', official: true, uploader: 'admin' },
        { difficulty: 'expert', lvBase: 9, lv: '9.7', name: '', official: true, uploader: 'admin' },
        { difficulty: 'master', lvBase: 11, lv: '11.5', name: '', official: true, uploader: 'admin' },
        { difficulty: 'master', lvBase: 12, lv: '12.0', name: 'xxxxxxxxxxxxxx', official: false, uploader: 'foobar' },
        { difficulty: 'master', lvBase: 14, lv: '14.2', name: 'yyyyyyyyyyyyyy', official: false, uploader: 'foobar' },
    ]
    let dummySongs: Array<{ genre: string, title: string, artist: string, notes: Array<{ difficulty: string, lvBase: number, lv: string, name: string, official: boolean, uploader: string }> }> = [
        { genre: 'VOCALOID', title: '太陽系デスコ', artist: 'ナユタン星人', notes: [{ difficulty: 'master', lvBase: 10, lv: '10.5', name: '测试谱面', official: false, uploader: 'admin' }] },
        { genre: 'VOCALOID', title: 'いーあるふぁんくらぶ', artist: 'みきとP', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ココロ', artist: 'トラボルタ', notes: dummyNotes },
        { genre: 'VOCALOID', title: '千本桜', artist: '黒うさP', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ダブルラリアット', artist: 'アゴアニキ', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ないせんのうた', artist: 'ナイセン - momoco-', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ハッピーシンセサイザ', artist: 'EasyPop', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'みくみくにしてあげる♪【してやんよ】', artist: 'ika', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ゆっくりしていってね！！！', artist: '今日犬', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ルカルカ★ナイトフィーバー', artist: 'samfree', notes: dummyNotes },
        { genre: 'VOCALOID', title: 'ワーワーワールド', artist: 'Giga & Mitchie M / 初音ミク、花里みのり、小豆沢こはね「プロジェクトセカイ カラフルステージ！ feat. 初音ミク」 ', notes: dummyNotes },
        { genre: '東方プロジェクト', title: '色は匂へど散りぬるを', artist: '幽閉サテライト', notes: dummyNotes },
        { genre: '東方プロジェクト', title: '神々が恋した幻想郷', artist: 'Unlucky Morpheus', notes: dummyNotes },
        { genre: '東方プロジェクト', title: '最終鬼畜妹フランドール・S', artist: 'ビートまりお(COOL＆CREATE)', notes: dummyNotes },
        { genre: '東方プロジェクト', title: 'チルノのパーフェクトさんすう教室', artist: 'ARM＋夕野ヨシミ(IOSYS)feat. miko', notes: dummyNotes },
        { genre: '東方プロジェクト', title: 'ナイト・オブ・ナイツ', artist: 'ビートまりお(COOL＆CREATE)', notes: dummyNotes },
        { genre: '東方プロジェクト', title: 'Bad Apple!! feat nomico', artist: 'Masayoshi Minoshima', notes: dummyNotes },
        { genre: '東方プロジェクト', title: '魔理沙は大変なものを盗んでいきました', artist: 'ARM＋夕野ヨシミ(IOSYS)feat. 藤咲かりん', notes: dummyNotes },
    ];
    return <Panel style={{ overflow: 'hidden', display: hide? 'none': 'flex', flexDirection: 'column', minHeight: '80vh', ...(props.style ?? {}) }}>
        <PortaritLayoutTabs/>
        <div style={{ marginBottom: '5px', display: 'flex' }}>
            <input type="text" placeholder="Keyword" style={{ flexGrow: '1', flexShrink: '1', minWidth: '0', marginRight: '5px' }}></input>
            <Link style={{ marginRight: '5px' }} onClick={() => {}}>Search</Link>
            <LinkToModal name={'filters'}>Filters...</LinkToModal>
        </div>
        <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flexGrow: '1', borderTop: '1px solid gray', borderBottom: '1px solid gray' }}>{dummySongs.map((song, i) => (
            <div key={i /*TODO*/} style={{ borderTop: (i != 0)? '1px solid lightgray': 'none', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: 'darkgray', marginRight: '5px', height: '30px', width: '30px', flexShrink: '0' }}></div>
                    <div lang="ja">{ song.title }</div>
                </div>
                <table className="notesTable" style={{ whiteSpace: 'nowrap', fontSize: '75%', width: '100%', margin: '5px 0px' }}><tbody>{ song.notes.map((notes, j) => (
                    <tr key={j /*TODO*/}>
                        <td>
                            <span style={{ color: 'white', fontWeight: 'bold', background: difficultyColors[notes.difficulty], height: '16px', width: '16px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div>{notes.lvBase}</div>
                            </span>
                            {' '}
                            <span>{notes.lv}</span>
                        </td>
                        <td style={{ width: '100%', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', left: '0', right: '0', top: '0', bottom: '0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                {notes.official? <><span style={{ color: 'red' }}>[official]</span>{' '}</>: <></>}
                                <span title={notes.name}>{notes.name}</span>
                            </div>
                        </td>
                        <td>
                            {notes.uploader}
                        </td>
                        <td>
                            <Link onClick={() => {play()}}>Play</Link>
                            {' '}
                            <Link onClick={() => {}}>Details...</Link>
                        </td>
                    </tr> 
                ))}</tbody></table>
            </div>
        ))}</div>
    </Panel>
}

function MaisimPanel(props: { children: JSX.Element, style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let l = (ctx.state.layout == 'landscape');
    return <Panel id="maisimPanel" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', ...(props.style ?? {}) }}>
        {props.children}
        <div>
            <div style={{ position: 'absolute', zIndex: '200000', left: '0px', top: '0px', display: l? 'block': 'none' }}>
                <label><input type="checkbox" checked={ctx.state.landscapeLeftPanelsVisible} onChange={() => { ctx.setState({ ...ctx.state, landscapeLeftPanelsVisible: !(ctx.state.landscapeLeftPanelsVisible) }) }}></input>Left Panels</label>
            </div>
            <div style={{ position: 'absolute', zIndex: '200000', right: '0px', top: '0px', display: l? 'block': 'none' }}>
                <label>Right Panels<input type="checkbox" checked={ctx.state.landscapeRightPanelsVisible} onChange={() => { ctx.setState({ ...ctx.state, landscapeRightPanelsVisible: !(ctx.state.landscapeRightPanelsVisible) }) }}></input></label>
            </div>
        </div>
    </Panel>
}

function PlayControlPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let playPause = () => {
        ctx.onPlay();
    }
    return <Panel style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', ...(props.style ?? {}) }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div>
                <select id="controlSpeedSelect">
                    <option value={1.00}>1.00x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={0.50}>0.50x</option>
                </select>
                {' '}
                <Link onClick={() => playPause()}>Play/Pause</Link>
                {' '}
                <Link onClick={() => {}}>Restart</Link>
            </div>
            <input id="controlSlider" type="range" min="0" max={10000 /* ad hoc hard coded value */}></input>
        </div>
    </Panel>
}

function NotesEditorPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let hide = (
        (ctx.state.layout == 'landscape' && !ctx.state.landscapeRightPanelsVisible)
        || (ctx.state.layout == 'portrait' && ctx.state.portraitCurrentTab != 'notes')
    );
    let l = (ctx.state.layout == 'landscape')
    return <Panel style={{ display: hide? 'none': 'block', ...(props.style ?? {}) }}>
        <PortaritLayoutTabs/>
        <div style={{ display: l? 'flex': 'block', flexDirection: 'column', height: l? '100%': undefined }}>
            {l? <div><b>Notes Editor</b></div>: <></>}
            <div style={{ flexGrow: '1' }}><textarea placeholder="notes data ......"  style={{ resize: 'none', minHeight: '150px', height: l? '100%': undefined, width: '100%', boxSizing: 'border-box' }}></textarea></div>
        </div>
    </Panel>
}

function DetailsPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let hide = (
        (ctx.state.layout == 'landscape' && !ctx.state.landscapeRightPanelsVisible)
        || (ctx.state.layout == 'portrait' && ctx.state.portraitCurrentTab != 'details')
    );
    let l = (ctx.state.layout == 'landscape')
    return <Panel style={{ display: hide? 'none': (l? 'flex': 'block'), justifyContent: 'center', alignItems: 'center', ...(props.style ?? {}) }}>
        <PortaritLayoutTabs/>
        <h1 style={{ textAlign: 'center' }}>Details</h1>
    </Panel>
}

export function UI(props: { maisim: JSX.Element, size: number, setSize: (newSize: number) => void, onPlay: () => void }): JSX.Element {
    let [state,setState] = useState(defaultState);
    let resizeCallback = () => {
        let [w, h] = [window.innerWidth, window.innerHeight];
        let newLayout = ((w < h)? 'portrait': 'landscape') as 'portrait'|'landscape';
        if (newLayout != state.layout) {
            setState({ ...state, layout: newLayout })
        }
        let resizeMaisim = () => {
            let maisimPanel = document.getElementById('maisimPanel')!;
            let style = getComputedStyle(maisimPanel);
            let newSize = parseFloat(style['height']);
            props.setSize(newSize);
        }
        if (newLayout != state.layout) {
            setTimeout(resizeMaisim, 0);
        } else {
            resizeMaisim();
        }
    };
    useEffect(() => {
        let t = setTimeout(resizeCallback, 0);
        return () => { clearTimeout(t); };
    }, []);
    useEffect(() => {
        window.addEventListener('resize', resizeCallback);
        return () => { window.removeEventListener('resize', resizeCallback); };
    }, [state]);
    let l = (state.layout == 'landscape');
    let leftColumn = state.landscapeLeftPanelsVisible;
    let rightColumn = state.landscapeRightPanelsVisible;
    if (!leftColumn && !rightColumn) { leftColumn = rightColumn = true; }
    return <Context.Provider value={{state,setState, onPlay:props.onPlay}}>
        <div style={{
                display: 'grid',
                gridTemplateColumns: l? `${leftColumn?(rightColumn?'minmax(auto,25vw)':'auto'):'0'} 100vh ${rightColumn?'auto':'0'}`: '1fr',
                gridTemplateRows: l? 'auto 4fr 2fr min-content': 'min-content 100vw min-content auto',
                overflow: l? 'hidden': 'auto',
                position: 'absolute', width: '100vw', height: '100vh', background: '#51BCF3'
            }}>
            <UserPanel style={{ gridArea: l? '1 / 1 / 2 / 2': '1 / 1 / 2 / 2' }} />
            <SongListPanel style={{ gridArea: l? '2 / 1 / 5 / 2': '4 / 1 / 5 / 2' }}/>
            <MaisimPanel style={{ gridArea: l? '1 / 2 / 4 / 3': '2 / 1 / 3 / 2' }}>{props.maisim}</MaisimPanel>
            <PlayControlPanel style={{ gridArea: l? '4 / 2 / 5 / 3': '3 / 1 / 4 / 2' }}/>
            <NotesEditorPanel style={{ gridArea: l? '1 / 3 / 3 / 4': '4 / 1 / 5 / 2' }}/>
            <DetailsPanel style={{ gridArea: l? '3 / 3 / 5 / 4': '4 / 1 / 5 / 2' }}/>
            <RegisterModal />
            <LoginModal />
            <MenuModal />
            <ProfileModal />
            <ProfileEditModal />
            <SongEditModal />
            <NotesEditModal />
            <InviteModal />
            <UsersModal />
            <FiltersModal />
        </div>
    </Context.Provider>
}


