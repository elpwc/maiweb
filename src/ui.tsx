import { createContext, useState, useContext, useEffect } from "react";

interface State {
    layout: 'landscape'|'portrait',
    landscapeLeftPanelsVisible: boolean,
    landscapeRightPanelsVisible: boolean,
    portraitCurrentTab: 'list'|'notes'|'details'
};
const defaultState: State = {
    layout: 'landscape' as 'landscape'|'portrait',
    landscapeLeftPanelsVisible: true,
    landscapeRightPanelsVisible: true,
    portraitCurrentTab: 'list' as 'list'|'notes'|'details'
}
const Context = createContext<{
    state: State,
    setState: (newState: State) => void
}>(null as any);

function Panel(props: { style?: React.CSSProperties, children: JSX.Element|JSX.Element[] }): JSX.Element {
    return <div style={{ background: 'white', boxShadow: '1px 3px 0px rgba(0, 0, 0, 0.4)', borderRadius: '5px', padding: '5px', margin: '5px 5px', ...(props.style ?? {}) }}>
        { props.children }
    </div>
}

function PortraitLayoutTab(props: { tab: 'list'|'notes'|'details', text: string }): JSX.Element {
    let ctx = useContext(Context);
    return <div><a href={ctx.state.portraitCurrentTab != props.tab? 'javascript:void(0)': undefined} onClick={() => ctx.setState({ ...ctx.state, portraitCurrentTab: props.tab })}>{props.text}</a></div>
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
    return <Panel style={{ display: hide? 'none': 'block', ...(props.style ?? {}) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ background: 'darkgray', marginRight: '5px', height: '20px', width: '20px', flexShrink: '0' }}></div>
                <div>UserName</div>
            </div>
            <div>
                <a href="javascript:void(0)">Profile...</a>
                {' '}
                <a href="javascript:void(0)">Logout...</a>
            </div>
        </div>
    </Panel>
}

function SongListPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
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
            <a href="javascript:void(0)" style={{ marginRight: '5px' }}>Search</a>
            <a href="javascript:void(0)">Filters...</a>
        </div>
        <div style={{ overflow: 'auto', display: 'flex', flexDirection: 'column', flexGrow: '1', borderTop: '1px solid gray', borderBottom: '1px solid gray' }}>{dummySongs.map((song, i) => (
            <div style={{ borderTop: (i != 0)? '1px solid lightgray': 'none', padding: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ background: 'darkgray', marginRight: '5px', height: '30px', width: '30px', flexShrink: '0' }}></div>
                    <div lang="ja">{ song.title }</div>
                </div>
                <table style={{ fontSize: '75%', width: '100%', margin: '5px 0px' }}>{ song.notes.map(notes => (
                    <tr>
                        <td>
                            <span style={{ color: 'white', fontWeight: 'bold', background: difficultyColors[notes.difficulty], height: '16px', width: '16px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div>{notes.lvBase}</div>
                            </span>
                            {' '}
                            <span>{notes.lv}</span>
                        </td>
                        <td>
                            {notes.official? [<span style={{ color: 'red' }}>[official]</span>, ' ']: []}
                            <span>{notes.name}</span>
                        </td>
                        <td>
                            {notes.uploader}
                        </td>
                        <td>
                            <a href="javascript:void(0)">Play</a>
                            {' '}
                            <a href="javascript:void(0)">Favorite</a>
                        </td>
                    </tr> 
                ))}</table>
            </div>
        ))}</div>
    </Panel>
}

function MaisimPanel(props: { style?: React.CSSProperties }): JSX.Element {
    let ctx = useContext(Context);
    let l = (ctx.state.layout == 'landscape');
    return <Panel style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', ...(props.style ?? {}) }}>
        <div> 
            <h1>Maisim</h1>
            <div style={{ position: 'absolute', left: '0px', top: '0px', display: l? 'block': 'none' }}>
                <label><input type="checkbox" checked={ctx.state.landscapeLeftPanelsVisible} onChange={() => { ctx.setState({ ...ctx.state, landscapeLeftPanelsVisible: !(ctx.state.landscapeLeftPanelsVisible) }) }}></input>Left Panels</label>
            </div>
            <div style={{ position: 'absolute', right: '0px', top: '0px', display: l? 'block': 'none' }}>
                <label>Right Panels<input type="checkbox" checked={ctx.state.landscapeRightPanelsVisible} onChange={() => { ctx.setState({ ...ctx.state, landscapeRightPanelsVisible: !(ctx.state.landscapeRightPanelsVisible) }) }}></input></label>
            </div>
        </div>
    </Panel>
}

function PlayControlPanel(props: { style?: React.CSSProperties }): JSX.Element {
    return <Panel style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'stretch', ...(props.style ?? {}) }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div>
                <select>
                    <option>1.00x</option>
                    <option>0.75x</option>
                    <option>0.50x</option>
                </select>
                {' '}
                <a href="javascript:void(0);">Play/Pause</a>
                {' '}
                <a href="javascript:void(0);">Restart</a>
            </div>
            <input type="range"></input>
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

export function UI(): JSX.Element {
    let [state,setState] = useState(defaultState);
    let resizeCallback = () => {
        let [w, h] = [window.innerWidth, window.innerHeight];
        let newLayout = ((w < h)? 'portrait': 'landscape') as 'portrait'|'landscape';
        if (newLayout != state.layout) {
            setState({ ...state, layout: newLayout })
        }
    };
    useEffect(() => {
        let t = setTimeout(resizeCallback, 0);
        return () => { clearTimeout(t); };
    }, [])
    useEffect(() => {
        window.addEventListener('resize', resizeCallback);
        return () => { window.removeEventListener('resize', resizeCallback); };
    }, [state]);
    let l = (state.layout == 'landscape');
    let leftColumn = state.landscapeLeftPanelsVisible;
    let rightColumn = state.landscapeRightPanelsVisible;
    if (!leftColumn && !rightColumn) { leftColumn = rightColumn = true; }
    return <Context.Provider value={{state,setState}}>
        <div style={{
                display: 'grid',
                gridTemplateColumns: l? `${leftColumn?'auto':'0'} 100vh ${rightColumn?'auto':'0'}`: '1fr',
                gridTemplateRows: l? 'auto 4fr 2fr min-content': 'min-content 100vw min-content auto',
                overflow: l? 'hidden': 'auto',
                position: 'absolute', width: '100vw', height: '100vh', background: '#51BCF3'
            }}>
            <UserPanel style={{ gridArea: l? '1 / 1 / 2 / 2': '1 / 1 / 2 / 2' }} />
            <SongListPanel style={{ gridArea: l? '2 / 1 / 5 / 2': '4 / 1 / 5 / 2' }}/>
            <MaisimPanel style={{ gridArea: l? '1 / 2 / 4 / 3': '2 / 1 / 3 / 2' }}/>
            <PlayControlPanel style={{ gridArea: l? '4 / 2 / 5 / 3': '3 / 1 / 4 / 2' }}/>
            <NotesEditorPanel style={{ gridArea: l? '1 / 3 / 3 / 4': '4 / 1 / 5 / 2' }}/>
            <DetailsPanel style={{ gridArea: l? '3 / 3 / 5 / 4': '4 / 1 / 5 / 2' }}/>
        </div>
    </Context.Provider>
}


