import { useEffect } from 'react';
import './index.css';

interface Props {
  winWidth: number;
  winHeight: number;
  showEditor: boolean;
  setshowEditor: (v: boolean) => void;
}

// eslint-disable-next-line import/no-anonymous-default-export
export default (props: Props) => {
  useEffect(() => {}, [props.winWidth, props.winHeight]);

  return (
    <div
      style={{
        border: 'solid 3px black',
        margin: '5px',
        padding: '5px',
        height: `${props.winHeight * 0.78}px`,
        width: `${props.winHeight * 0.78 * 0.3}px`,
      }}
    >
      <div style={{ zIndex: 114514, position: 'relative' }}>
        <button
          onClick={() => {
            props.setshowEditor(!props.showEditor);
          }}
        >
          {props.showEditor ? '隐藏谱面编辑器' : '显示谱面编辑器'}
        </button>
        <button>上传谱面</button>
        <button>登录</button>
        <button>注册</button>
      </div>
    </div>
  );
};
